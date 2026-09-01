import { IsObject, IsOptional } from 'class-validator'; export class AssignmentRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
