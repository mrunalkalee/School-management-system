import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsDate, IsEmail, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Gender } from '../admission.schema';

export class CreateAdmissionDto {
  @ApiProperty({ example: 'Aarav' }) @IsString() @MaxLength(100) applicantFirstName: string;
  @ApiProperty({ example: 'Sharma' }) @IsString() @MaxLength(100) applicantLastName: string;
  @ApiProperty({ example: '2015-04-20T00:00:00.000Z', format: 'date-time' }) @Type(() => Date) @IsDate() dateOfBirth: Date;
  @ApiProperty({ enum: Gender, example: Gender.Male }) @IsEnum(Gender) gender: Gender;
  @ApiProperty({ example: 'Priya Sharma' }) @IsString() @MaxLength(200) guardianName: string;
  @ApiProperty({ example: '+919876543210' }) @IsString() @MaxLength(50) guardianContact: string;
  @ApiProperty({ example: 'priya@example.com' }) @IsEmail() @MaxLength(254) guardianEmail: string;
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' }) @IsString() @MaxLength(100) appliedClassId: string;
  @ApiPropertyOptional({ type: [String], example: ['https://files.example.com/birth-certificate.pdf'] })
  @IsOptional() @IsArray() @ArrayUnique() @IsUrl({}, { each: true }) documents?: string[];
}
