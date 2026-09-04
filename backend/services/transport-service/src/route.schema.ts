import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RouteDocument = HydratedDocument<Route>;

@Schema({ _id: false })
export class RouteStop {
  @Prop({ required: true, trim: true, maxlength: 150 })
  stopName: string;

  @Prop({ required: true, trim: true, maxlength: 10 })
  pickupTime: string;
}

export const RouteStopSchema = SchemaFactory.createForClass(RouteStop);

@Schema({ timestamps: true })
export class Route {
  @Prop({ required: true, trim: true, maxlength: 150, index: true })
  routeName: string;

  @Prop({ required: true, trim: true, maxlength: 50, unique: true })
  vehicleNumber: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  driverName: string;

  @Prop({ required: true, trim: true, maxlength: 30 })
  driverContact: string;

  @Prop({ required: true, type: [RouteStopSchema], validate: [(stops: RouteStop[]) => stops.length > 0, 'At least one stop is required'] })
  stops: RouteStop[];
}

export const RouteSchema = SchemaFactory.createForClass(Route);
