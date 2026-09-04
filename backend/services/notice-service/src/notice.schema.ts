import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NoticeDocument = HydratedDocument<Notice>;
export enum TargetRole { All = 'all', Admin = 'admin', Teacher = 'teacher', Student = 'student', Parent = 'parent' }

@Schema({ timestamps: true })
export class Notice {
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ required: true, trim: true, maxlength: 10000 }) message: string;
  @Prop({ required: true, enum: TargetRole, default: TargetRole.All, index: true }) targetRole: TargetRole;
  // ID owned by class-subject-service and validated over HTTP only when supplied.
  @Prop({ trim: true, index: true }) targetClassId?: string;
  // TODO: derive this from the authenticated Admin identity once auth-service exists.
  @Prop({ trim: true }) postedBy?: string;
  @Prop({ required: true, default: Date.now, index: true }) postedAt: Date;
  @Prop({ index: true }) expiryDate?: Date;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
NoticeSchema.index({ targetRole: 1, targetClassId: 1, expiryDate: 1 });
