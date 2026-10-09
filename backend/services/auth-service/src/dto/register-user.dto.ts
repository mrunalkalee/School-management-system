import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../user.schema';

export class RegisterUserDto {
  @ApiProperty({ example: 'Aarav Sharma' })
  @IsString() @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'aarav@example.com' })
  @IsEmail() @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8, format: 'password' })
  @IsString() @MinLength(8) @MaxLength(128)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.Student })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4ce1', description: 'Optional student-service or teacher-service profile ID' })
  @IsOptional() @IsString() @MaxLength(100)
  linkedProfileId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['66b5d38acd65f26429ab4ce1'],
    description: 'Student profile IDs visible to a parent account. Leave empty for other roles.',
  })
  @IsOptional() @IsArray() @IsString({ each: true }) @MaxLength(100, { each: true })
  linkedStudentIds?: string[];
}
