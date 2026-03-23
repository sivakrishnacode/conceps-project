import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SaveNameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
