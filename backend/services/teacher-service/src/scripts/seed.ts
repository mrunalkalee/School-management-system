import 'dotenv/config';
import mongoose from 'mongoose';
import { TeacherSchema } from '../teacher.schema';

const uri = process.env.MONGODB_URI;

const sampleTeachers = [
  { firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@example.com', phone: '+919876543210', qualification: 'M.Sc. Mathematics, B.Ed.', subjectsHandled: ['Mathematics', 'Physics'] },
  { firstName: 'Arjun', lastName: 'Nair', email: 'arjun.nair@example.com', phone: '+919876543211', qualification: 'M.A. English, B.Ed.', subjectsHandled: ['English', 'Literature'] },
  { firstName: 'Kavita', lastName: 'Rao', email: 'kavita.rao@example.com', phone: '+919876543212', qualification: 'M.Sc. Biology, B.Ed.', subjectsHandled: ['Biology', 'Chemistry'] },
  { firstName: 'Rohan', lastName: 'Das', email: 'rohan.das@example.com', phone: '+919876543213', qualification: 'M.Tech. Computer Science', subjectsHandled: ['Computer Science'] },
  { firstName: 'Sana', lastName: 'Khan', email: 'sana.khan@example.com', phone: '+919876543214', qualification: 'M.A. History, B.Ed.', subjectsHandled: ['History', 'Civics'] },
];

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const TeacherModel = mongoose.model('Teacher', TeacherSchema);
  await TeacherModel.bulkWrite(
    sampleTeachers.map((teacher) => ({
      updateOne: { filter: { email: teacher.email }, update: { $setOnInsert: teacher }, upsert: true },
    })),
  );
  console.log('Seeded 5 sample teachers.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
