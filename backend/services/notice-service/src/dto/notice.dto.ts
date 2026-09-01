import { IsObject, IsOptional } from 'class-validator'; export class NoticeRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
