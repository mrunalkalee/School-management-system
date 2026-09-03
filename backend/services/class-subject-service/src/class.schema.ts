import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SchoolClassDocument = HydratedDocument<SchoolClass>;

@Schema({ timestamps: true })
export class SchoolClass {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  section: string;

  @Prop({ required: true, trim: true })
  academicYear: string;

  // ID owned by teacher-service and validated over HTTP on creation.
  @Prop({ required: true, trim: true })
  classTeacherId: string;

  // IDs owned by student-service and validated over HTTP when assigned.
  @Prop({ type: [String], default: [] })
  studentIds: string[];
}

export const SchoolClassSchema = SchemaFactory.createForClass(SchoolClass);
