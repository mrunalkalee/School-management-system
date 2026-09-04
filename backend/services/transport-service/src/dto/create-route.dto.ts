import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';

export class CreateRouteStopDto {
  @ApiProperty({ example: 'Central Park' })
  @IsString() @MaxLength(150)
  stopName: string;

  @ApiProperty({ example: '07:35', description: '24-hour HH:mm pickup time' })
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  pickupTime: string;
}

export class CreateRouteDto {
  @ApiProperty({ example: 'North Campus Route' })
  @IsString() @MaxLength(150)
  routeName: string;

  @ApiProperty({ example: 'KA-01-AB-1234' })
  @IsString() @MaxLength(50)
  vehicleNumber: string;

  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsString() @MaxLength(150)
  driverName: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString() @MaxLength(30)
  driverContact: string;

  @ApiProperty({ type: [CreateRouteStopDto], example: [{ stopName: 'Central Park', pickupTime: '07:35' }] })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CreateRouteStopDto)
  stops: CreateRouteStopDto[];
}
