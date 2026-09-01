import { IsObject, IsOptional } from 'class-validator'; export class NotificationRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
