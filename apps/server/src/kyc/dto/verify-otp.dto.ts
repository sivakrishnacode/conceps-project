import { IsNumberString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}
