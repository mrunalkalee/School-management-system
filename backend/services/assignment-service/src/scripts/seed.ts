import 'dotenv/config';
import mongoose from 'mongoose';
import { AssignmentSchema } from '../assignment.schema';
import { SubmissionSchema, SubmissionStatus } from '../submission.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const AssignmentModel = mongoose.model('Assignment', AssignmentSchema);
  const SubmissionModel = mongoose.model('Submission', SubmissionSchema);
  const assignment = await AssignmentModel.findOneAndUpdate(
    { title: 'Sample Algebra Assignment', classId: 'replace-with-class-id', subjectId: 'replace-with-subject-id' },
    { $setOnInsert: { title: 'Sample Algebra Assignment', description: 'Replace placeholder IDs before production use.', classId: 'replace-with-class-id', subjectId: 'replace-with-subject-id', teacherId: 'replace-with-teacher-id', dueDate: new Date('2026-10-20T23:59:00.000Z') } },
    { new: true, upsert: true },
  );
  await SubmissionModel.findOneAndUpdate(
    { assignmentId: assignment.id, studentId: 'replace-with-student-id' },
    { $setOnInsert: { assignmentId: assignment.id, studentId: 'replace-with-student-id', submissionText: 'Sample submission', submittedAt: new Date(), status: SubmissionStatus.Submitted } },
    { new: true, upsert: true },
  );
  console.log('Seeded sample assignment and submission documents. Replace placeholder IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
