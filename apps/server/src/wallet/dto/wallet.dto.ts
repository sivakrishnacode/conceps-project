import { IsNumber, IsPositive, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionCategory } from '@repo/shared';

export class AddMoneyDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  promoCode?: string;
}

export class WithdrawDto {
  @IsNumber()
  @Min(100, { message: 'Minimum withdrawal amount is ₹100' })
  amount: number;
}

export class TransactionFilterDto {
  @IsOptional()
  @IsString()
  type?: TransactionType;

  @IsOptional()
  @IsString()
  category?: TransactionCategory;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
