import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LeaveStatus } from '../leave-request.schema';

export class ReviewLeaveRequestDto {
  @ApiProperty({ enum: [LeaveStatus.Approved, LeaveStatus.Rejected], example: LeaveStatus.Approved })
  @IsEnum([LeaveStatus.Approved, LeaveStatus.Rejected])
  status: LeaveStatus.Approved | LeaveStatus.Rejected;

  // TODO: derive from the authenticated Admin identity instead of accepting this input.
  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4cff' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reviewedBy?: string;
}
