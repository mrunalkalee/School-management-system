import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AttendanceStatus } from '../attendance.schema';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ enum: AttendanceStatus, example: AttendanceStatus.Leave })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  // TODO: populate from a JWT-derived API Gateway header once auth-service exists.
  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4cff' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  markedBy?: string;
}
