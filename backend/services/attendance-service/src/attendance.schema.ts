import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

export enum AttendanceStatus {
  Present = 'present',
  Absent = 'absent',
  Leave = 'leave',
}

@Schema({ timestamps: true })
export class Attendance {
  // ID owned by student-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  studentId: string;

  // ID owned by class-subject-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  classId: string;

  @Prop({ required: true, trim: true, index: true })
  date: string;

  @Prop({ required: true, enum: AttendanceStatus })
  status: AttendanceStatus;

  // TODO: populate from a JWT-derived API Gateway header once auth-service exists.
  @Prop({ trim: true })
  markedBy?: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
