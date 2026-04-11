import {
  IsDateString,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(4)
  @MaxLength(20)
  name: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @MaxLength(30)
  bio: string;
  @IsOptional()
  @IsDateString()
  birthdate: Date;
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;
}
