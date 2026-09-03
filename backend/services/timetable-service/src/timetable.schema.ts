import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TimetableDocument = HydratedDocument<Timetable>;

@Schema({ _id: false })
export class Period {
  @Prop({ required: true, min: 1 })
  periodNumber: number;

  @Prop({ required: true, trim: true })
  subjectId: string;

  // ID owned by teacher-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true })
  teacherId: string;

  @Prop({ required: true, trim: true })
  startTime: string;

  @Prop({ required: true, trim: true })
  endTime: string;
}

export const PeriodSchema = SchemaFactory.createForClass(Period);

@Schema({ timestamps: true })
export class Timetable {
  // ID owned by class-subject-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  classId: string;

  @Prop({ required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], index: true })
  dayOfWeek: string;

  @Prop({ type: [PeriodSchema], required: true })
  periods: Period[];
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
TimetableSchema.index({ classId: 1, dayOfWeek: 1 }, { unique: true });
