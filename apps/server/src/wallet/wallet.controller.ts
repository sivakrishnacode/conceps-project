import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AddMoneyDto, WithdrawDto, TransactionFilterDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getBalances(@Request() req) {
    return this.walletService.getBalances(req.user.userId);
  }

  @Post('add-money')
  addMoney(@Request() req, @Body() dto: AddMoneyDto) {
    return this.walletService.addMoney(req.user.userId, dto);
  }

  @Post('withdraw')
  withdraw(@Request() req, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(req.user.userId, dto);
  }

  @Get('passbook')
  getPassbook(@Request() req, @Query('page') page: string, @Query('limit') limit: string) {
    return this.walletService.getPassbook(
      req.user.userId,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
  }

  @Get('transactions')
  getTransactions(@Request() req, @Query() filter: TransactionFilterDto) {
    return this.walletService.getTransactions(req.user.userId, filter);
  }
}
