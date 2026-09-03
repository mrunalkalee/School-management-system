import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

export enum RequesterType {
  Student = 'student',
  Teacher = 'teacher',
}

export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

@Schema({ timestamps: true })
export class LeaveRequest {
  // ID is owned by student-service or teacher-service and validated over HTTP.
  @Prop({ required: true, trim: true, index: true })
  requesterId: string;

  @Prop({ required: true, enum: RequesterType })
  requesterType: RequesterType;

  @Prop({ required: true, index: true })
  fromDate: Date;

  @Prop({ required: true, index: true })
  toDate: Date;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  reason: string;

  @Prop({ required: true, enum: LeaveStatus, default: LeaveStatus.Pending, index: true })
  status: LeaveStatus;

  // TODO: derive this from the authenticated Admin identity once auth-service exists.
  @Prop({ trim: true })
  reviewedBy?: string;

  @Prop()
  reviewedAt?: Date;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);
LeaveRequestSchema.index({ requesterId: 1, fromDate: -1 });
