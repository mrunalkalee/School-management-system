import { IsObject, IsOptional } from 'class-validator'; export class AdmissionRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
