import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ required: true, trim: true, maxlength: 10000 }) description: string;
  @Prop({ required: true, index: true }) date: Date;
  @Prop({ trim: true }) location?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
