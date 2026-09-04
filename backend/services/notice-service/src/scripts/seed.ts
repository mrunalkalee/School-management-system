import 'dotenv/config';
import mongoose from 'mongoose';
import { EventSchema } from '../event.schema';
import { NoticeSchema, TargetRole } from '../notice.schema';

const uri = process.env.MONGODB_URI;
async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const NoticeModel = mongoose.model('Notice', NoticeSchema);
  const EventModel = mongoose.model('Event', EventSchema);
  await NoticeModel.findOneAndUpdate({ title: 'Welcome to the new academic year' }, { $setOnInsert: { title: 'Welcome to the new academic year', message: 'Classes begin next Monday.', targetRole: TargetRole.All, expiryDate: new Date('2026-12-31T00:00:00.000Z') } }, { new: true, upsert: true });
  await EventModel.findOneAndUpdate({ title: 'Annual Science Fair' }, { $setOnInsert: { title: 'Annual Science Fair', description: 'Students present their science projects.', date: new Date('2026-11-05T09:00:00.000Z'), location: 'Main Auditorium' } }, { new: true, upsert: true });
  console.log('Seeded sample notice and event documents.');
  await mongoose.disconnect();
}
void seed().catch(async (error: unknown) => { console.error(error); await mongoose.disconnect(); process.exitCode = 1; });
