import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MarksDocument = HydratedDocument<Marks>;

@Schema({ timestamps: true })
export class Marks {
  @Prop({ required: true, trim: true, index: true })
  examId: string;

  // ID owned by student-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  studentId: string;

  @Prop({ required: true, min: 0 })
  marksObtained: number;

  @Prop({ required: true, enum: ['A+', 'A', 'B', 'C', 'F'] })
  grade: string;

  @Prop({ trim: true, maxlength: 1000 })
  remarks?: string;
}

export const MarksSchema = SchemaFactory.createForClass(Marks);
MarksSchema.index({ examId: 1, studentId: 1 }, { unique: true });
