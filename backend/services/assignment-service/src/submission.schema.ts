import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

export enum SubmissionStatus {
  Pending = 'pending',
  Submitted = 'submitted',
  Graded = 'graded',
}

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true, trim: true, index: true })
  assignmentId: string;

  // ID owned by student-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  studentId: string;

  @Prop({ trim: true, maxlength: 10000 })
  submissionText?: string;

  @Prop({ trim: true })
  attachmentUrl?: string;

  @Prop({ required: true, default: Date.now })
  submittedAt: Date;

  @Prop({ required: true, enum: SubmissionStatus, default: SubmissionStatus.Pending })
  status: SubmissionStatus;

  @Prop({ trim: true, maxlength: 100 })
  grade?: string;

  @Prop({ trim: true, maxlength: 5000 })
  feedback?: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
