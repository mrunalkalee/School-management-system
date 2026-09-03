import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdmissionDocument = HydratedDocument<Admission>;

export enum Gender { Male = 'male', Female = 'female', Other = 'other' }
export enum AdmissionStatus { Pending = 'pending', Approved = 'approved', Rejected = 'rejected' }

@Schema({ timestamps: true })
export class Admission {
  @Prop({ required: true, trim: true }) applicantFirstName: string;
  @Prop({ required: true, trim: true }) applicantLastName: string;
  @Prop({ required: true }) dateOfBirth: Date;
  @Prop({ required: true, enum: Gender }) gender: Gender;
  @Prop({ required: true, trim: true }) guardianName: string;
  @Prop({ required: true, trim: true }) guardianContact: string;
  @Prop({ required: true, trim: true, lowercase: true }) guardianEmail: string;
  // ID owned by class-subject-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true }) appliedClassId: string;
  @Prop({ type: [String], required: true, default: [] }) documents: string[];
  @Prop({ required: true, enum: AdmissionStatus, default: AdmissionStatus.Pending, index: true }) status: AdmissionStatus;
  @Prop({ required: true, default: Date.now }) submittedAt: Date;
  // TODO: derive this from the authenticated reviewer once auth-service exists.
  @Prop({ trim: true }) reviewedBy?: string;
  @Prop() reviewedAt?: Date;
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);
AdmissionSchema.index({ appliedClassId: 1, status: 1, submittedAt: -1 });
