import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CertificateRequestStatus } from '../certificate.schema';

export class ReviewCertificateRequestDto {
  @ApiProperty({ enum: [CertificateRequestStatus.Approved, CertificateRequestStatus.Rejected] })
  @IsEnum(CertificateRequestStatus) status: CertificateRequestStatus.Approved | CertificateRequestStatus.Rejected;

  @ApiPropertyOptional({ example: 'Please contact the office with the required documents.' })
  @IsOptional() @IsString() @MaxLength(500) rejectionReason?: string;
}
