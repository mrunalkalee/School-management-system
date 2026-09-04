import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IssueRecordDocument = HydratedDocument<IssueRecord>;

export enum BorrowerType { Student = 'student', Teacher = 'teacher' }
export enum IssueStatus { Issued = 'issued', Returned = 'returned', Overdue = 'overdue' }

@Schema({ timestamps: true })
export class IssueRecord {
  @Prop({ required: true, trim: true, index: true })
  bookId: string;

  @Prop({ required: true, trim: true, index: true })
  borrowerId: string;

  @Prop({ required: true, enum: BorrowerType, index: true })
  borrowerType: BorrowerType;

  @Prop({ required: true, default: Date.now })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  returnDate?: Date;

  @Prop({ required: true, default: 0, min: 0 })
  fineAmount: number;

  @Prop({ required: true, enum: IssueStatus, default: IssueStatus.Issued, index: true })
  status: IssueStatus;
}

export const IssueRecordSchema = SchemaFactory.createForClass(IssueRecord);
IssueRecordSchema.index({ borrowerId: 1, issueDate: -1 });
IssueRecordSchema.index({ bookId: 1, status: 1 });
