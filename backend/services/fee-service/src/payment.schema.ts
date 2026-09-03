import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentMode {
  Cash = 'cash',
  Card = 'card',
  Online = 'online',
  BankTransfer = 'bank-transfer',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Partial = 'partial',
}

@Schema({ timestamps: true })
export class Payment {
  // ID owned by student-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  studentId: string;

  @Prop({ required: true, trim: true, index: true })
  feeStructureId: string;

  @Prop({ required: true, min: 0 })
  amountPaid: number;

  @Prop({ required: true, default: Date.now })
  paymentDate: Date;

  @Prop({ required: true, enum: PaymentMode })
  paymentMode: PaymentMode;

  @Prop({ required: true, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop({ trim: true, maxlength: 200 })
  transactionRef?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ studentId: 1, feeStructureId: 1, paymentDate: -1 });
