import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMoneyDto, WithdrawDto, TransactionFilterDto } from './dto/wallet.dto';
import { TransactionType, TransactionCategory, KycStatus } from '@repo/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) { }

  async getBalances(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const result = await this.prisma.transaction.aggregate({
      where: { walletId: wallet.id },
      _sum: { amount: true },
      _count: { id: true }
    });

    return {
      depositBalance: Number(wallet.depositBalance),
      winningsBalance: Number(wallet.winningsBalance),
      totalBalance: Number(wallet.depositBalance) + Number(wallet.winningsBalance),
      totalTransactions: result._count.id,
    };
  }

  async addMoney(userId: string, dto: AddMoneyDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    // Basic Add money tx
    let bonusAmount = 0;

    // Promo Code handling would go here, fetching and validating promo

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          depositBalance: { increment: dto.amount }
        }
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.CREDIT,
          category: TransactionCategory.DEPOSIT,
          amount: dto.amount,
          description: 'Money added to wallet',
        }
      });

      return { wallet: updatedWallet, transaction };
    });
  }

  async creditWinnings(userId: string, amount: number, description: string = 'Contest winnings') {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { winningsBalance: { increment: amount } }
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.CREDIT,
          category: TransactionCategory.WINNING,
          amount,
          description,
        }
      });

      return updatedWallet;
    });
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kyc: true, wallet: true }
    });

    if (!user || !user.wallet) throw new NotFoundException('User/Wallet not found');
    const walletId = user.wallet.id;
    const depositBalance = Number(user.wallet.depositBalance);
    const winningsBalance = Number(user.wallet.winningsBalance);
    const totalBalance = depositBalance + winningsBalance;

    if (user.kyc?.status !== KycStatus.VERIFIED) {
      throw new BadRequestException('KYC verification is required to withdraw funds.');
    }

    if (totalBalance < dto.amount) {
      throw new BadRequestException(`Insufficient balance. Available: ₹${totalBalance.toFixed(2)}`);
    }

    // Drain depositBalance first, then winningsBalance for the remainder
    const deductFromDeposit = Math.min(dto.amount, depositBalance);
    const deductFromWinnings = dto.amount - deductFromDeposit;

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          depositBalance: { decrement: deductFromDeposit },
          winningsBalance: { decrement: deductFromWinnings },
        }
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: walletId,
          userId,
          type: TransactionType.DEBIT,
          category: TransactionCategory.WITHDRAWAL,
          amount: dto.amount,
          description: `Withdrawal (Deposit: ₹${deductFromDeposit}, Winnings: ₹${deductFromWinnings})`,
        }
      });

      return { wallet: updatedWallet, transaction };
    });
  }

  async getPassbook(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // GroupBy directly using Prisma
    const grouped = await this.prisma.transaction.groupBy({
      by: ['createdAt'],
      where: { userId },
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
    });

    return grouped;
  }

  async getTransactions(userId: string, filter: TransactionFilterDto) {
    const whereClause: Prisma.TransactionWhereInput = { userId };

    if (filter.type) whereClause.type = filter.type as TransactionType;
    if (filter.category) whereClause.category = filter.category as TransactionCategory;

    if (filter.startDate || filter.endDate) {
      whereClause.createdAt = {};
      if (filter.startDate) whereClause.createdAt.gte = new Date(filter.startDate);
      if (filter.endDate) whereClause.createdAt.lte = new Date(filter.endDate);
    }

    const page = filter.page || 1;
    const limit = filter.limit || 10;

    const [total, transactions] = await this.prisma.$transaction([
      this.prisma.transaction.count({ where: whereClause }),
      this.prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { total, transactions, page, limit };
  }
}
