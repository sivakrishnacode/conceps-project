import { Controller, Post, Get, Body, Headers, UseGuards, Request } from '@nestjs/common';
import { KycService } from './kyc.service';
import { SubmitKycDto } from './dto/kyc.dto';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}


  @UseGuards(JwtAuthGuard)
  @Post('generate-otp')
  generateOtp(@Request() req, @Body() dto: GenerateOtpDto) {
    return this.kycService.generateOtp(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  verifyOtp(@Request() req, @Body() dto: VerifyOtpDto) {
    return this.kycService.verifyAadhaarOtp(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submit(@Request() req, @Body() dto: SubmitKycDto) {
    return this.kycService.submit(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@Request() req) {
    return this.kycService.getStatus(req.user.userId);
  }

}
