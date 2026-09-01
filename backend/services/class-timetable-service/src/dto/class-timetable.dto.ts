import { IsObject, IsOptional } from 'class-validator'; export class ClassTimetableRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
