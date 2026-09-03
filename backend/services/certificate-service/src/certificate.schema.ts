import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CertificateDocument = HydratedDocument<Certificate>;

export enum CertificateType { IdCard = 'id-card', Bonafide = 'bonafide', Transfer = 'transfer' }

@Schema({ timestamps: true })
export class Certificate {
  // ID owned by student-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true }) studentId: string;
  @Prop({ required: true, enum: CertificateType, index: true }) type: CertificateType;
  @Prop({ required: true, default: Date.now }) issuedDate: Date;
  // Placeholder only; real PDF creation is intentionally outside this service phase.
  @Prop({ trim: true }) fileUrl?: string;
  // TODO: derive this from the authenticated issuer once auth-service exists.
  @Prop({ trim: true }) issuedBy?: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ studentId: 1, issuedDate: -1 });
