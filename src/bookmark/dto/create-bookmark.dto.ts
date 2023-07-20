import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsString()
  @IsOptional()
  description?: string;
}
