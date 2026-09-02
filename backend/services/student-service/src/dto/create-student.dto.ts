import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Gender } from '../student.schema';

export class CreateStudentDto {
  @ApiProperty({ example: 'Aarav' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'aarav.sharma@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '12 Park Street, Kolkata', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '2010-05-15', type: String, format: 'date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty({ enum: Gender, example: Gender.Male, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'STU-2026-001', required: false })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1', required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ example: 'Priya Sharma', required: false })
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiProperty({ example: '+919876543211', required: false })
  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @ApiProperty({ example: 'priya.sharma@example.com', required: false })
  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @ApiProperty({ example: '2026-04-01', type: String, format: 'date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  admissionDate?: Date;

  @ApiProperty({ example: 'https://cdn.example.com/students/aarav.jpg', required: false })
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
