import { IsObject, IsOptional } from 'class-validator'; export class ExaminationRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
