import 'dotenv/config';
import mongoose from 'mongoose';
import { AdmissionSchema, AdmissionStatus, Gender } from '../admission.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const AdmissionModel = mongoose.model('Admission', AdmissionSchema);
  await AdmissionModel.findOneAndUpdate(
    { guardianEmail: 'parent@example.com', appliedClassId: 'replace-with-class-id' },
    { $setOnInsert: { applicantFirstName: 'Aarav', applicantLastName: 'Sharma', dateOfBirth: new Date('2015-04-20T00:00:00.000Z'), gender: Gender.Male, guardianName: 'Priya Sharma', guardianContact: '+919876543210', guardianEmail: 'parent@example.com', appliedClassId: 'replace-with-class-id', documents: ['https://example.com/replace-with-document-url.pdf'], status: AdmissionStatus.Pending } },
    { new: true, upsert: true },
  );
  console.log('Seeded a sample admission. Replace placeholder IDs and URLs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
