import { IsObject, IsOptional } from 'class-validator'; export class StudentRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
