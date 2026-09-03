import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AssignmentDocument = HydratedDocument<Assignment>;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  // ID owned by class-subject-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  classId: string;

  @Prop({ required: true, trim: true, index: true })
  subjectId: string;

  @Prop({ required: true, trim: true })
  teacherId: string;

  @Prop({ required: true, index: true })
  dueDate: Date;

  @Prop({ trim: true })
  attachmentUrl?: string;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
AssignmentSchema.index({ classId: 1, subjectId: 1, dueDate: 1 });
