import { IsNumberString, Length } from 'class-validator';

export class GenerateOtpDto {
  @IsNumberString()
  @Length(12, 12)
  aadhaarNumber: string;
}
