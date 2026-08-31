import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;
export enum StudentStatus { ACTIVE = 'active', INACTIVE = 'inactive', GRADUATED = 'graduated', TRANSFERRED = 'transferred' }
export enum Gender { MALE = 'male', FEMALE = 'female', OTHER = 'other' }

@Schema({ _id: false })
export class Address {
  @Prop({ trim: true }) street?: string;
  @Prop({ trim: true }) city?: string;
  @Prop({ trim: true }) state?: string;
  @Prop({ trim: true }) zipCode?: string;
  @Prop({ trim: true }) country?: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
export class Guardian {
  @Prop({ trim: true }) name?: string;
  @Prop({ trim: true }) relation?: string;
  @Prop({ trim: true }) phone?: string;
  @Prop({ trim: true, lowercase: true }) email?: string;
}
export const GuardianSchema = SchemaFactory.createForClass(Guardian);

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, trim: true }) firstName!: string;
  @Prop({ required: true, trim: true }) lastName!: string;
  @Prop({ required: true, unique: true, trim: true }) rollNumber!: string;
  @Prop({ required: true, unique: true, trim: true }) admissionNumber!: string;
  @Prop({ required: true }) dateOfBirth!: Date;
  @Prop({ required: true, enum: Gender }) gender!: Gender;
  @Prop({ required: true, trim: true }) class!: string;
  @Prop({ required: true, trim: true }) section!: string;
  @Prop({ trim: true, lowercase: true }) email?: string;
  @Prop({ trim: true }) phone?: string;
  @Prop({ type: AddressSchema, default: {} }) address!: Address;
  @Prop({ type: GuardianSchema, default: {} }) guardian!: Guardian;
  @Prop({ required: true, default: Date.now }) admissionDate!: Date;
  @Prop({ enum: StudentStatus, default: StudentStatus.ACTIVE }) status!: StudentStatus;
  @Prop() profileImageUrl?: string;
}
export const StudentSchema = SchemaFactory.createForClass(Student);
// `unique: true` on rollNumber and admissionNumber creates their unique indexes.
StudentSchema.index({ class: 1, section: 1 });
