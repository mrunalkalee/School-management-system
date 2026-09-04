import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'The Alchemist' })
  @IsString() @MaxLength(300)
  title: string;

  @ApiProperty({ example: 'Paulo Coelho' })
  @IsString() @MaxLength(200)
  author: string;

  @ApiProperty({ example: '9780061122415' })
  @IsString() @MaxLength(50)
  isbn: string;

  @ApiProperty({ example: 'Fiction' })
  @IsString() @MaxLength(100)
  category: string;

  @ApiProperty({ example: 5, minimum: 1 })
  @Type(() => Number) @IsInt() @Min(1)
  totalCopies: number;
}
