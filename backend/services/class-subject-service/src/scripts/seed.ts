import 'dotenv/config';
import mongoose from 'mongoose';
import { SchoolClassSchema } from '../class.schema';
import { SubjectSchema } from '../subject.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const ClassModel = mongoose.model('SchoolClass', SchoolClassSchema);
  const SubjectModel = mongoose.model('Subject', SubjectSchema);

  const classes = await Promise.all([
    ClassModel.findOneAndUpdate({ name: 'Grade 10', section: 'A', academicYear: '2026-2027' }, { $setOnInsert: { name: 'Grade 10', section: 'A', academicYear: '2026-2027', classTeacherId: 'replace-with-teacher-id' } }, { new: true, upsert: true }),
    ClassModel.findOneAndUpdate({ name: 'Grade 10', section: 'B', academicYear: '2026-2027' }, { $setOnInsert: { name: 'Grade 10', section: 'B', academicYear: '2026-2027', classTeacherId: 'replace-with-teacher-id' } }, { new: true, upsert: true }),
  ]);

  await SubjectModel.bulkWrite([
    { updateOne: { filter: { code: 'MATH-10A' }, update: { $setOnInsert: { name: 'Mathematics', code: 'MATH-10A', classId: classes[0]._id.toString() } }, upsert: true } },
    { updateOne: { filter: { code: 'SCI-10A' }, update: { $setOnInsert: { name: 'Science', code: 'SCI-10A', classId: classes[0]._id.toString() } }, upsert: true } },
    { updateOne: { filter: { code: 'ENG-10B' }, update: { $setOnInsert: { name: 'English', code: 'ENG-10B', classId: classes[1]._id.toString() } }, upsert: true } },
  ]);

  console.log('Seeded 2 sample classes and 3 sample subjects. Replace placeholder teacher IDs before using the classes in production.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
