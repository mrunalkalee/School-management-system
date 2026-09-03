import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaymentMode } from '../payment.schema';

export class RecordPaymentDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  studentId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce5' })
  @IsString()
  @MaxLength(100)
  feeStructureId: string;

  @ApiProperty({ example: 10000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amountPaid: number;

  @ApiProperty({ enum: PaymentMode, example: PaymentMode.Online })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiPropertyOptional({ example: 'pay_123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  transactionRef?: string;
}
