import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeacherDocument = HydratedDocument<Teacher>;

@Schema({ timestamps: true })
export class Teacher {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  qualification?: string;

  @Prop({ type: [String], default: [] })
  subjectsHandled: string[];

  @Prop({ default: Date.now })
  joiningDate: Date;

  @Prop({ trim: true })
  profilePhotoUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  // Set by auth-service once it exists; nullable until that integration is available.
  @Prop({ type: String, default: null })
  userId?: string | null;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
