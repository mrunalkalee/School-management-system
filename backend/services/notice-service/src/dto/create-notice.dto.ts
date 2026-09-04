import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TargetRole } from '../notice.schema';

export class CreateNoticeDto {
  @ApiProperty({ example: 'School closed on Friday' }) @IsString() @MaxLength(200) title: string;
  @ApiProperty({ example: 'The school will remain closed due to a public holiday.' }) @IsString() @MaxLength(10000) message: string;
  @ApiPropertyOptional({ enum: TargetRole, default: TargetRole.All }) @IsOptional() @IsEnum(TargetRole) targetRole?: TargetRole;
  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4ce2' }) @IsOptional() @IsString() @MaxLength(100) targetClassId?: string;
  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4cff' }) @IsOptional() @IsString() @MaxLength(100) postedBy?: string;
  @ApiPropertyOptional({ example: '2026-10-15T00:00:00.000Z', format: 'date-time' }) @IsOptional() @Type(() => Date) @IsDate() expiryDate?: Date;
}
