import { IsString, IsNotEmpty, IsBoolean, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
  mobile: string;

  @IsBoolean()
  isAgeCertified: boolean;
}
