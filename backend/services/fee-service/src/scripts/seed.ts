import 'dotenv/config';
import mongoose from 'mongoose';
import { FeeStructureSchema } from '../fee-structure.schema';
import { PaymentMode, PaymentSchema, PaymentStatus } from '../payment.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const FeeStructureModel = mongoose.model('FeeStructure', FeeStructureSchema);
  const PaymentModel = mongoose.model('Payment', PaymentSchema);
  const feeStructure = await FeeStructureModel.findOneAndUpdate(
    { classId: 'replace-with-class-id', academicYear: '2026-2027', feeType: 'Tuition' },
    { $setOnInsert: { classId: 'replace-with-class-id', academicYear: '2026-2027', feeType: 'Tuition', amount: 25000, dueDate: new Date('2026-06-15T00:00:00.000Z') } },
    { new: true, upsert: true },
  );
  await PaymentModel.findOneAndUpdate(
    { studentId: 'replace-with-student-id', feeStructureId: feeStructure.id, transactionRef: 'sample-payment-ref' },
    { $setOnInsert: { studentId: 'replace-with-student-id', feeStructureId: feeStructure.id, amountPaid: 10000, paymentDate: new Date(), paymentMode: PaymentMode.Online, status: PaymentStatus.Partial, transactionRef: 'sample-payment-ref' } },
    { new: true, upsert: true },
  );
  console.log('Seeded sample fee structure and payment documents. Replace placeholder IDs before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
