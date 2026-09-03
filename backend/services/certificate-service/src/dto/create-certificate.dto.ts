import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { CertificateType } from '../certificate.schema';

export class CreateCertificateDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString() @MaxLength(100) studentId: string;

  @ApiProperty({ enum: CertificateType, example: CertificateType.Bonafide })
  @IsEnum(CertificateType) type: CertificateType;

  @ApiPropertyOptional({ example: 'https://files.example.com/certificates/bonafide.pdf' })
  @IsOptional() @IsUrl() fileUrl?: string;

  // TODO: derive this from the authenticated issuer once auth-service exists.
  @ApiPropertyOptional({ example: '66b5d38acd65f26429ab4cff' })
  @IsOptional() @IsString() @MaxLength(100) issuedBy?: string;
}
