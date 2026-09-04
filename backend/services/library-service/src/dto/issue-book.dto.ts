import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString, MaxLength } from 'class-validator';
import { BorrowerType } from '../issue-record.schema';

export class IssueBookDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString() @MaxLength(100)
  bookId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' })
  @IsString() @MaxLength(100)
  borrowerId: string;

  @ApiProperty({ enum: BorrowerType, example: BorrowerType.Student })
  @IsEnum(BorrowerType)
  borrowerType: BorrowerType;

  @ApiProperty({ example: '2026-10-20T00:00:00.000Z' })
  @Type(() => Date) @IsDate()
  dueDate: Date;
}
