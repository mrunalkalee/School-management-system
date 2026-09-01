import { IsObject, IsOptional } from 'class-validator'; export class CertificateRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
