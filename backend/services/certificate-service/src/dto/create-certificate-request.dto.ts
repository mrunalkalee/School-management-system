import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CertificateType } from '../certificate.schema';

export class CreateCertificateRequestDto {
  @ApiProperty({ enum: CertificateType, example: CertificateType.Bonafide })
  @IsEnum(CertificateType) type: CertificateType;
}
