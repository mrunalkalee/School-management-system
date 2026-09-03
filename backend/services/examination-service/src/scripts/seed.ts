import 'dotenv/config';
import mongoose from 'mongoose';
import { ExamSchema, ExamType } from '../exam.schema';
import { MarksSchema } from '../marks.schema';
import { computeGrade } from '../exams.service';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const ExamModel = mongoose.model('Exam', ExamSchema);
  const MarksModel = mongoose.model('Marks', MarksSchema);
  const exam = await ExamModel.findOneAndUpdate(
    { name: 'Sample Unit Test', classId: 'replace-with-class-id', subjectId: 'replace-with-subject-id' },
    { $setOnInsert: { name: 'Sample Unit Test', classId: 'replace-with-class-id', subjectId: 'replace-with-subject-id', examDate: new Date('2026-10-15T09:00:00.000Z'), maxMarks: 100, examType: ExamType.UnitTest } },
    { new: true, upsert: true },
  );
  await MarksModel.findOneAndUpdate(
    { examId: exam.id, studentId: 'replace-with-student-id' },
    { $setOnInsert: { examId: exam.id, studentId: 'replace-with-student-id', marksObtained: 85, grade: computeGrade(85, 100), remarks: 'Replace placeholder IDs before production use.' } },
    { new: true, upsert: true },
  );
  console.log('Seeded a sample exam and marks document. Replace placeholder IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
