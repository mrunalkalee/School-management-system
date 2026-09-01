import { IsObject, IsOptional } from 'class-validator'; export class LeaveRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
