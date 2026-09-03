import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Algebra problem set 3' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Complete questions 1 through 20 and show your working.' })
  @IsString()
  @MaxLength(10000)
  description: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' })
  @IsString()
  @MaxLength(100)
  classId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce3' })
  @IsString()
  @MaxLength(100)
  subjectId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce4' })
  @IsString()
  @MaxLength(100)
  teacherId: string;

  @ApiProperty({ example: '2026-10-20T23:59:00.000Z', format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @ApiPropertyOptional({ example: 'https://files.example.com/algebra-set-3.pdf' })
  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;
}
