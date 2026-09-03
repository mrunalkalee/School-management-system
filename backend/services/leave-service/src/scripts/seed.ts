import 'dotenv/config';
import mongoose from 'mongoose';
import { LeaveRequestSchema, LeaveStatus, RequesterType } from '../leave-request.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const LeaveRequestModel = mongoose.model('LeaveRequest', LeaveRequestSchema);
  await LeaveRequestModel.findOneAndUpdate(
    { requesterId: 'replace-with-student-id', fromDate: new Date('2026-10-10T00:00:00.000Z') },
    { $setOnInsert: { requesterId: 'replace-with-student-id', requesterType: RequesterType.Student, fromDate: new Date('2026-10-10T00:00:00.000Z'), toDate: new Date('2026-10-12T00:00:00.000Z'), reason: 'Sample medical leave request', status: LeaveStatus.Pending } },
    { new: true, upsert: true },
  );
  console.log('Seeded a sample leave request. Replace placeholder IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
