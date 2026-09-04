import { HttpService } from '@nestjs/axios';
import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Book } from './book.schema';
import { IssueBookDto } from './dto/issue-book.dto';
import { BorrowerType, IssueRecord, IssueRecordDocument, IssueStatus } from './issue-record.schema';

@Injectable()
export class IssueRecordsService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
    @InjectModel(IssueRecord.name) private readonly issueRecordModel: Model<IssueRecord>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async issue(dto: IssueBookDto): Promise<IssueRecordDocument> {
    if (dto.dueDate <= new Date()) throw new BadRequestException('Due date must be in the future');
    await this.remote<unknown>(this.borrowerServiceUrl(dto.borrowerType), dto.borrowerId, dto.borrowerType);
    const book = await this.bookModel.findOneAndUpdate({ _id: dto.bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }, { new: true }).exec();
    if (!book) {
      const exists = await this.bookModel.exists({ _id: dto.bookId });
      if (!exists) throw new NotFoundException(`Book ${dto.bookId} was not found`);
      throw new BadRequestException('No copies of this book are currently available');
    }
    try {
      return await new this.issueRecordModel({ ...dto, status: IssueStatus.Issued }).save();
    } catch (error: unknown) {
      await this.bookModel.updateOne({ _id: dto.bookId }, { $inc: { availableCopies: 1 } }).exec();
      throw error;
    }
  }

  async returnBook(issueId: string): Promise<IssueRecordDocument> {
    const issue = await this.issueRecordModel.findById(issueId).exec();
    if (!issue) throw new NotFoundException(`Issue record ${issueId} was not found`);
    if (issue.status === IssueStatus.Returned) throw new ConflictException('This book has already been returned');
    const returnDate = new Date();
    const fineAmount = lateDays(issue.dueDate, returnDate) * 5;
    const returned = await this.issueRecordModel.findOneAndUpdate({ _id: issueId, status: { $ne: IssueStatus.Returned } }, { $set: { status: IssueStatus.Returned, returnDate, fineAmount } }, { new: true }).exec();
    if (!returned) throw new ConflictException('This book has already been returned');
    await this.bookModel.updateOne({ _id: returned.bookId }, { $inc: { availableCopies: 1 } }).exec();
    return returned;
  }

  async findStudentHistory(studentId: string): Promise<IssueRecordDocument[]> {
    return this.issueRecordModel.find({ borrowerId: studentId, borrowerType: BorrowerType.Student }).sort({ issueDate: -1 }).exec();
  }

  private async remote<T>(baseUrl: string, id: string, borrowerType: BorrowerType): Promise<T> {
    const label = borrowerType === BorrowerType.Student ? 'Student' : 'Teacher';
    try {
      return (await firstValueFrom(this.httpService.get<T>(`${baseUrl}/${encodeURIComponent(id)}`))).data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) throw new NotFoundException(`${label} ${id} was not found`);
      if (axios.isAxiosError(error) && !error.response) throw new ServiceUnavailableException(`Unable to reach ${label.toLowerCase()} service`);
      throw error;
    }
  }

  private borrowerServiceUrl(type: BorrowerType): string {
    return this.configService.getOrThrow<string>(type === BorrowerType.Student ? 'STUDENT_SERVICE_URL' : 'TEACHER_SERVICE_URL');
  }
}

function lateDays(dueDate: Date, returnDate: Date): number {
  const due = Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
  const returned = Date.UTC(returnDate.getUTCFullYear(), returnDate.getUTCMonth(), returnDate.getUTCDate());
  return Math.max(0, Math.ceil((returned - due) / 86_400_000));
}
