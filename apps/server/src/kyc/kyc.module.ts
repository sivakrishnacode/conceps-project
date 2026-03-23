import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { UidaiService } from './uidai.service';

@Module({
  providers: [KycService, UidaiService],
  controllers: [KycController],
})
export class KycModule {}
