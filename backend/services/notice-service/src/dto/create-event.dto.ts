import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Annual Science Fair' }) @IsString() @MaxLength(200) title: string;
  @ApiProperty({ example: 'Students will present their science projects.' }) @IsString() @MaxLength(10000) description: string;
  @ApiProperty({ example: '2026-11-05T09:00:00.000Z', format: 'date-time' }) @Type(() => Date) @IsDate() date: Date;
  @ApiPropertyOptional({ example: 'Main Auditorium' }) @IsOptional() @IsString() @MaxLength(300) location?: string;
}
