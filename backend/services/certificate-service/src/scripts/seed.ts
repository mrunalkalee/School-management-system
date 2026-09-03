import 'dotenv/config';
import mongoose from 'mongoose';
import { CertificateSchema, CertificateType } from '../certificate.schema';

const uri = process.env.MONGODB_URI;
async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const CertificateModel = mongoose.model('Certificate', CertificateSchema);
  await CertificateModel.findOneAndUpdate(
    { studentId: 'replace-with-student-id', type: CertificateType.Bonafide },
    { $setOnInsert: { studentId: 'replace-with-student-id', type: CertificateType.Bonafide, fileUrl: 'https://example.com/replace-with-certificate-url.pdf', issuedBy: 'replace-with-issuer-id' } },
    { new: true, upsert: true },
  );
  console.log('Seeded a sample certificate. Replace placeholder IDs and URL before production use.');
  await mongoose.disconnect();
}
void seed().catch(async (error: unknown) => { console.error(error); await mongoose.disconnect(); process.exitCode = 1; });
