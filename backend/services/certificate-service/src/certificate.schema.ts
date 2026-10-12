import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CertificateDocument = HydratedDocument<Certificate>;

export enum CertificateType { IdCard = 'id-card', Bonafide = 'bonafide', Transfer = 'transfer' }
export enum CertificateRequestStatus { Pending = 'pending', Approved = 'approved', Rejected = 'rejected' }
export enum CertificateRecipientType { Student = 'student', Teacher = 'teacher' }

@Schema({ timestamps: true })
export class Certificate {
  // Kept for existing records; new requests use recipientId and recipientType.
  @Prop({ trim: true, index: true }) studentId?: string;
  @Prop({ required: true, trim: true, index: true }) recipientId: string;
  @Prop({ required: true, enum: CertificateRecipientType, index: true }) recipientType: CertificateRecipientType;
  @Prop({ required: true, enum: CertificateType, index: true }) type: CertificateType;
  @Prop({ required: true, enum: CertificateRequestStatus, default: CertificateRequestStatus.Pending, index: true }) status: CertificateRequestStatus;
  @Prop() issuedDate?: Date;
  // Placeholder only; real PDF creation is intentionally outside this service phase.
  @Prop({ trim: true }) fileUrl?: string;
  @Prop({ trim: true }) issuedBy?: string;
  @Prop({ trim: true }) reviewedBy?: string;
  @Prop() reviewedAt?: Date;
  @Prop({ trim: true, maxlength: 500 }) rejectionReason?: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ recipientId: 1, createdAt: -1 });
