import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole { Admin = 'admin', Teacher = 'teacher', Student = 'student', Parent = 'parent' }

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, maxlength: 150 })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true, index: true, maxlength: 254 })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.Student, index: true })
  role: UserRole;

  @Prop({ trim: true, maxlength: 100, index: true })
  linkedProfileId?: string;

  @Prop({ required: true, default: true, index: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
