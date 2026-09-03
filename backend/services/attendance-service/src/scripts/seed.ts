import 'dotenv/config';
import mongoose from 'mongoose';
import { AttendanceSchema, AttendanceStatus } from '../attendance.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const AttendanceModel = mongoose.model('Attendance', AttendanceSchema);

  await AttendanceModel.findOneAndUpdate(
    { studentId: 'replace-with-student-id', date: '2026-09-03' },
    {
      $setOnInsert: {
        studentId: 'replace-with-student-id',
        classId: 'replace-with-class-id',
        date: '2026-09-03',
        status: AttendanceStatus.Present,
        markedBy: 'replace-with-marker-id',
      },
    },
    { new: true, upsert: true },
  );

  console.log('Seeded a sample attendance record. Replace placeholder IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
