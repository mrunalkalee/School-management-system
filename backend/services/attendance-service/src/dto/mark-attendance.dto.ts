import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { AttendanceStatus } from '../attendance.schema';

export class AttendanceRecordDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.Present })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class MarkAttendanceDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' })
  @IsString()
  @MaxLength(100)
  classId: string;

  @ApiProperty({ example: '2026-09-03', format: 'date' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [AttendanceRecordDto], example: [{ studentId: '66b5d38acd65f26429ab4ce1', status: AttendanceStatus.Present }] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];

  // TODO: populate from a JWT-derived API Gateway header once auth-service exists.
  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4cff' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  markedBy?: string;
}
