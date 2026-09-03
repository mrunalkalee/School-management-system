import 'dotenv/config';
import mongoose from 'mongoose';
import { TimetableSchema } from '../timetable.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const TimetableModel = mongoose.model('Timetable', TimetableSchema);

  await TimetableModel.findOneAndUpdate(
    { classId: 'replace-with-class-id', dayOfWeek: 'Monday' },
    {
      $setOnInsert: {
        classId: 'replace-with-class-id',
        dayOfWeek: 'Monday',
        periods: [
          { periodNumber: 1, subjectId: 'replace-with-subject-id', teacherId: 'replace-with-teacher-id', startTime: '09:00', endTime: '09:45' },
          { periodNumber: 2, subjectId: 'replace-with-subject-id', teacherId: 'replace-with-teacher-id', startTime: '09:45', endTime: '10:30' },
        ],
      },
    },
    { new: true, upsert: true },
  );

  console.log('Seeded a sample Monday timetable. Replace placeholder class, subject, and teacher IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
