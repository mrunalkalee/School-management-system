import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  // ID owned by the Classes aggregate in this same microservice.
  @Prop({ required: true, trim: true })
  classId: string;

  // ID owned by teacher-service; this association is not populated here.
  @Prop({ trim: true })
  teacherId?: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
