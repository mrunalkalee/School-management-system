import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Book, BookDocument } from './book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { IssueRecord, IssueStatus } from './issue-record.schema';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private readonly bookModel: Model<Book>, @InjectModel(IssueRecord.name) private readonly issueRecordModel: Model<IssueRecord>) {}

  async create(createBookDto: CreateBookDto): Promise<BookDocument> {
    try {
      return await new this.bookModel({ ...createBookDto, availableCopies: createBookDto.totalCopies }).save();
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) throw new ConflictException('A book with this ISBN already exists');
      throw error;
    }
  }

  async findAll(search?: string): Promise<BookDocument[]> {
    const filter = search?.trim()
      ? { $or: ['title', 'author', 'isbn', 'category'].map((field) => ({ [field]: { $regex: escapeRegex(search.trim()), $options: 'i' } })) }
      : {};
    return this.bookModel.find(filter).sort({ title: 1, author: 1 }).exec();
  }

  async update(id: string, dto: UpdateBookDto): Promise<BookDocument> {
    await this.findOne(id);
    try { const book = await this.bookModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec(); if (!book) throw new NotFoundException(`Book ${id} was not found`); return book; }
    catch (error: unknown) { if (isDuplicateKeyError(error)) throw new ConflictException('A book with this ISBN already exists'); throw error; }
  }
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    const activeIssues = await this.issueRecordModel.exists({ bookId: id, status: { $in: [IssueStatus.Issued, IssueStatus.Overdue] } });
    if (activeIssues) throw new BadRequestException('This book cannot be deleted because it has active or overdue issue records');
    await this.bookModel.findByIdAndDelete(id).exec(); return { message: 'Book deleted successfully' };
  }
  private async findOne(id: string): Promise<BookDocument> { if (!isValidObjectId(id)) throw new NotFoundException(`Book ${id} was not found`); const book = await this.bookModel.findById(id).exec(); if (!book) throw new NotFoundException(`Book ${id} was not found`); return book; }
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
}

function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
