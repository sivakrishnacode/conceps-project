import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { KycModule } from './kyc/kyc.module';
import { PromoModule } from './promo/promo.module';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    UserModule,
    WalletModule,
    KycModule,
    PromoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
