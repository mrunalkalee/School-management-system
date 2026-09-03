import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString, MaxLength } from 'class-validator';
import { RequesterType } from '../leave-request.schema';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  requesterId: string;

  @ApiProperty({ enum: RequesterType, example: RequesterType.Student })
  @IsEnum(RequesterType)
  requesterType: RequesterType;

  @ApiProperty({ example: '2026-10-10T00:00:00.000Z', format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  fromDate: Date;

  @ApiProperty({ example: '2026-10-12T00:00:00.000Z', format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  toDate: Date;

  @ApiProperty({ example: 'Medical leave' })
  @IsString()
  @MaxLength(5000)
  reason: string;
}
