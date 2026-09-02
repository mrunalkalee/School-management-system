import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ enum: Gender })
  gender?: Gender;

  @Prop({ unique: true, sparse: true, trim: true })
  rollNumber?: string;

  // This is an ID managed by class-subject-service; it is never populated here.
  @Prop({ trim: true })
  classId?: string;

  @Prop({ trim: true })
  section?: string;

  @Prop({ trim: true })
  guardianName?: string;

  @Prop({ trim: true })
  guardianPhone?: string;

  @Prop({ trim: true, lowercase: true })
  guardianEmail?: string;

  @Prop({ default: Date.now })
  admissionDate: Date;

  @Prop({ trim: true })
  profilePhotoUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  // Set by auth-service once it exists; nullable until that integration is available.
  @Prop({ type: String, default: null })
  userId?: string | null;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
