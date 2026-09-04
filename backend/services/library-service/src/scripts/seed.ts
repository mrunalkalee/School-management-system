import 'dotenv/config';
import mongoose from 'mongoose';
import { BookSchema } from '../book.schema';
import { BorrowerType, IssueRecordSchema, IssueStatus } from '../issue-record.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const BookModel = mongoose.model('Book', BookSchema);
  const IssueRecordModel = mongoose.model('IssueRecord', IssueRecordSchema);
  const book = await BookModel.findOneAndUpdate(
    { isbn: '9780061122415' },
    { $setOnInsert: { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780061122415', category: 'Fiction', totalCopies: 5, availableCopies: 4 } },
    { new: true, upsert: true },
  );
  await IssueRecordModel.findOneAndUpdate(
    { bookId: book.id, borrowerId: 'replace-with-student-id', status: IssueStatus.Issued },
    { $setOnInsert: { bookId: book.id, borrowerId: 'replace-with-student-id', borrowerType: BorrowerType.Student, dueDate: new Date('2026-10-20T00:00:00.000Z'), status: IssueStatus.Issued } },
    { new: true, upsert: true },
  );
  console.log('Seeded a sample book and issue record. Replace placeholder IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
