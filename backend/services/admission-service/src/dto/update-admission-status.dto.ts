import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdmissionStatus } from '../admission.schema';

export class UpdateAdmissionStatusDto {
  @ApiProperty({ enum: [AdmissionStatus.Approved, AdmissionStatus.Rejected], example: AdmissionStatus.Approved })
  @IsEnum([AdmissionStatus.Approved, AdmissionStatus.Rejected])
  status: AdmissionStatus.Approved | AdmissionStatus.Rejected;

  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4cff' })
  @IsOptional() @IsString() @MaxLength(100) reviewedBy?: string;
}
