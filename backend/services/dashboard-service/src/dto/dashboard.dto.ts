import { IsObject, IsOptional } from 'class-validator'; export class DashboardSnapshotRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
