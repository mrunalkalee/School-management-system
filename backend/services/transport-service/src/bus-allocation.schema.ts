import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BusAllocationDocument = HydratedDocument<BusAllocation>;

@Schema({ timestamps: true })
export class BusAllocation {
  @Prop({ required: true, trim: true, unique: true, index: true })
  studentId: string;

  @Prop({ required: true, trim: true, index: true })
  routeId: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  stopName: string;
}

export const BusAllocationSchema = SchemaFactory.createForClass(BusAllocation);
