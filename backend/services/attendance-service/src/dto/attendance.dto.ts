import { IsObject, IsOptional } from 'class-validator'; export class AttendanceRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
