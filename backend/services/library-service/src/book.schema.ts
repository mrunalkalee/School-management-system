import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, trim: true, maxlength: 300, index: true })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 200, index: true })
  author: string;

  @Prop({ required: true, trim: true, unique: true, maxlength: 50 })
  isbn: string;

  @Prop({ required: true, trim: true, maxlength: 100, index: true })
  category: string;

  @Prop({ required: true, min: 0 })
  totalCopies: number;

  @Prop({ required: true, min: 0 })
  availableCopies: number;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });
