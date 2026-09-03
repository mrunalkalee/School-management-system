import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';
import { ExamType } from '../exam.schema';

export class CreateExamDto {
  @ApiProperty({ example: 'Mathematics Midterm' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' })
  @IsString()
  @MaxLength(100)
  classId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce3' })
  @IsString()
  @MaxLength(100)
  subjectId: string;

  @ApiProperty({ example: '2026-10-15T09:00:00.000Z', format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  examDate: Date;

  @ApiProperty({ example: 100, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxMarks: number;

  @ApiProperty({ enum: ExamType, example: ExamType.Midterm })
  @IsEnum(ExamType)
  examType: ExamType;
}

export class UpdateExamDto extends PartialType(CreateExamDto) {}
