import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'MATH-10-A' })
  @IsString()
  @MaxLength(30)
  code: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  classId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4cff', required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;
}
