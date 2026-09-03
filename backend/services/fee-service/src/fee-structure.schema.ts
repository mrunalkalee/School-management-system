import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FeeStructureDocument = HydratedDocument<FeeStructure>;

@Schema({ timestamps: true })
export class FeeStructure {
  // ID owned by class-subject-service and validated over HTTP before persistence.
  @Prop({ required: true, trim: true, index: true })
  classId: string;

  @Prop({ required: true, trim: true, index: true })
  academicYear: string;

  @Prop({ required: true, trim: true })
  feeType: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, index: true })
  dueDate: Date;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
FeeStructureSchema.index({ classId: 1, academicYear: 1, feeType: 1 }, { unique: true });
