import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PromoService } from './promo.service';
import { ValidatePromoDto } from './dto/promo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post('validate')
  validatePromo(@Request() req, @Body() dto: ValidatePromoDto) {
    return this.promoService.validatePromo(req.user.userId, dto);
  }
}
