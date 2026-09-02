import 'dotenv/config';
import mongoose from 'mongoose';
import { Gender, StudentSchema } from '../student.schema';

const uri = process.env.MONGODB_URI;

const sampleStudents = [
  { firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@example.com', rollNumber: 'STU-001', classId: 'sample-class-1', section: 'A', gender: Gender.Male },
  { firstName: 'Diya', lastName: 'Patel', email: 'diya.patel@example.com', rollNumber: 'STU-002', classId: 'sample-class-1', section: 'A', gender: Gender.Female },
  { firstName: 'Vivaan', lastName: 'Gupta', email: 'vivaan.gupta@example.com', rollNumber: 'STU-003', classId: 'sample-class-1', section: 'B', gender: Gender.Male },
  { firstName: 'Ananya', lastName: 'Singh', email: 'ananya.singh@example.com', rollNumber: 'STU-004', classId: 'sample-class-2', section: 'A', gender: Gender.Female },
  { firstName: 'Reyansh', lastName: 'Kumar', email: 'reyansh.kumar@example.com', rollNumber: 'STU-005', classId: 'sample-class-2', section: 'B', gender: Gender.Other },
];

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const StudentModel = mongoose.model('Student', StudentSchema);
  await StudentModel.bulkWrite(
    sampleStudents.map((student) => ({
      updateOne: { filter: { email: student.email }, update: { $setOnInsert: student }, upsert: true },
    })),
  );
  console.log('Seeded 5 sample students.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
