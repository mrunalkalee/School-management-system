import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExamDocument = HydratedDocument<Exam>;

export enum ExamType {
  UnitTest = 'unit-test',
  Midterm = 'midterm',
  Final = 'final',
  OnlineTest = 'online-test',
}

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true, trim: true })
  name: string;

  // ID owned by class-subject-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  classId: string;

  @Prop({ required: true, trim: true, index: true })
  subjectId: string;

  @Prop({ required: true, index: true })
  examDate: Date;

  @Prop({ required: true, min: 1 })
  maxMarks: number;

  @Prop({ required: true, enum: ExamType, index: true })
  examType: ExamType;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
ExamSchema.index({ classId: 1, subjectId: 1, examDate: -1 });
