import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Meera' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Iyer' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'meera.iyer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'M.Sc. Mathematics, B.Ed.', required: false })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({ example: ['Mathematics', 'Physics'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjectsHandled?: string[];

  @ApiProperty({ example: '2024-06-01', type: String, format: 'date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  joiningDate?: Date;

  @ApiProperty({ example: 'https://cdn.example.com/teachers/meera.jpg', required: false })
  @IsOptional()
  @IsUrl()
  profilePhotoUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '66b5d38acd65f26429ab4cff', nullable: true, required: false })
  @IsOptional()
  @IsString()
  userId?: string | null;
}
