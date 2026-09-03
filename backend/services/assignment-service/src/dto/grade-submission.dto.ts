import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GradeSubmissionDto {
  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  grade?: string;

  @ApiPropertyOptional({ example: 'Excellent reasoning. Please check question 14 again.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  feedback?: string;
}
