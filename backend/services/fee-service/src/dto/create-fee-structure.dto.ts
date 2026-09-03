import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateFeeStructureDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' })
  @IsString()
  @MaxLength(100)
  classId: string;

  @ApiProperty({ example: '2026-2027' })
  @IsString()
  @MaxLength(30)
  academicYear: string;

  @ApiProperty({ example: 'Tuition' })
  @IsString()
  @MaxLength(100)
  feeType: string;

  @ApiProperty({ example: 25000, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z', format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  dueDate: Date;
}
