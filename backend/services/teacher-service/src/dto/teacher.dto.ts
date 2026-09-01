import { IsObject, IsOptional } from 'class-validator'; export class TeacherRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
