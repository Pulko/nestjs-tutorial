import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  readonly email?: string;
}
