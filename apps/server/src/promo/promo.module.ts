import { Module } from '@nestjs/common';
import { PromoService } from './promo.service';
import { PromoController } from './promo.controller';

@Module({
  providers: [PromoService],
  controllers: [PromoController],
})
export class PromoModule {}
