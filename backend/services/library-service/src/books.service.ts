import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './book.schema';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private readonly bookModel: Model<Book>) {}

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
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
}

function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
