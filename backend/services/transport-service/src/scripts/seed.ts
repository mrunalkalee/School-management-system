import 'dotenv/config';
import mongoose from 'mongoose';
import { BusAllocationSchema } from '../bus-allocation.schema';
import { RouteSchema } from '../route.schema';

const uri = process.env.MONGODB_URI;

async function seed(): Promise<void> {
  if (!uri) throw new Error('MONGODB_URI is required to run the seed script');
  await mongoose.connect(uri);
  const RouteModel = mongoose.model('Route', RouteSchema);
  const BusAllocationModel = mongoose.model('BusAllocation', BusAllocationSchema);
  const route = await RouteModel.findOneAndUpdate(
    { vehicleNumber: 'KA-01-AB-1234' },
    { $setOnInsert: { routeName: 'North Campus Route', vehicleNumber: 'KA-01-AB-1234', driverName: 'Ramesh Kumar', driverContact: '+919876543210', stops: [{ stopName: 'Central Park', pickupTime: '07:35' }, { stopName: 'City Mall', pickupTime: '07:50' }] } },
    { new: true, upsert: true },
  );
  await BusAllocationModel.findOneAndUpdate(
    { studentId: 'replace-with-student-id' },
    { $setOnInsert: { studentId: 'replace-with-student-id', routeId: route.id, stopName: 'Central Park' } },
    { new: true, upsert: true },
  );
  console.log('Seeded a sample route and allocation. Replace the placeholder student ID before production use.');
  await mongoose.disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
