import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  studentId: string;

  @ApiPropertyOptional({ example: 'I have included my calculations below.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  submissionText?: string;

  @ApiPropertyOptional({ example: 'https://files.example.com/student-work.pdf' })
  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;
}
