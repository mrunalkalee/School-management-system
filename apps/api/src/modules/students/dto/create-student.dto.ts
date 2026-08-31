import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Gender, StudentStatus } from '../schemas/student.schema';

export class AddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() zipCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
}
export class GuardianDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
}
export class CreateStudentDto {
  @ApiProperty() @IsString() firstName!: string;
  @ApiProperty() @IsString() lastName!: string;
  @ApiProperty({ example: '10-A-001' }) @IsString() rollNumber!: string;
  @ApiProperty({ example: 'ADM-2026-001' }) @IsString() admissionNumber!: string;
  @ApiProperty({ example: '2010-05-12' }) @IsDateString() dateOfBirth!: string;
  @ApiProperty({ enum: Gender }) @IsEnum(Gender) gender!: Gender;
  @ApiProperty({ example: '10' }) @IsString() class!: string;
  @ApiProperty({ example: 'A' }) @IsString() section!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ type: AddressDto }) @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @ApiPropertyOptional({ type: GuardianDto }) @IsOptional() @ValidateNested() @Type(() => GuardianDto) guardian?: GuardianDto;
  @ApiPropertyOptional({ example: '2026-04-01' }) @IsOptional() @IsDateString() admissionDate?: string;
  @ApiPropertyOptional({ enum: StudentStatus }) @IsOptional() @IsEnum(StudentStatus) status?: StudentStatus;
  @ApiPropertyOptional() @IsOptional() @IsUrl() profileImageUrl?: string;
}
