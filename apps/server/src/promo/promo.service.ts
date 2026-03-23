import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidatePromoDto } from './dto/promo.dto';

@Injectable()
export class PromoService {
  constructor(private readonly prisma: PrismaService) {}

  async validatePromo(userId: string, dto: ValidatePromoDto) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
      include: {
        userPromos: {
          where: { userId },
        },
      },
    });

    if (!promo) {
      throw new NotFoundException('Promo code not found');
    }

    if (promo.validUntil < new Date()) {
      throw new BadRequestException('Promo code has expired');
    }

    if (promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    if (promo.userPromos.length > 0) {
      throw new BadRequestException('You have already used this promo code');
    }

    if (dto.depositAmount < Number(promo.minDeposit)) {
      throw new BadRequestException(`Minimum deposit amount for this promo is ₹${promo.minDeposit}`);
    }

    const calculatedBonus = (dto.depositAmount * Number(promo.discountPercent)) / 100;
    const bonus = Math.min(calculatedBonus, Number(promo.maxBonus));

    return { isValid: true, bonus, promoId: promo.id };
  }
}
