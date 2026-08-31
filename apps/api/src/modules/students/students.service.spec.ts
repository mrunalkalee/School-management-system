import { ConflictException, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
describe('StudentsService', () => {
  const model: any = { create: jest.fn(), findById: jest.fn(), findByIdAndUpdate: jest.fn() };
  const service = new StudentsService(model);
  beforeEach(() => jest.clearAllMocks());
  it('creates a student', async () => { model.create.mockResolvedValue({ firstName: 'Ada' }); await expect(service.create({ firstName: 'Ada' } as any)).resolves.toEqual({ firstName: 'Ada' }); });
  it('converts duplicate keys to conflict errors', async () => { model.create.mockRejectedValue({ code: 11000, keyPattern: { rollNumber: 1 } }); await expect(service.create({} as any)).rejects.toBeInstanceOf(ConflictException); });
  it('throws for an unknown student', async () => { model.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }); await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException); });
});
