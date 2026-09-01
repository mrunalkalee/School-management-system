import { IsObject, IsOptional } from 'class-validator'; export class LibraryItemRequestDto { @IsObject() data!: Record<string, unknown>; @IsOptional() id?: string; }
