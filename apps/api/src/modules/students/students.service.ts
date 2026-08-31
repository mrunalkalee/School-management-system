import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument, StudentStatus } from './schemas/student.schema';

export interface StudentsQuery { page?: number; limit?: number; class?: string; section?: string; status?: StudentStatus; search?: string }

@Injectable()
export class StudentsService {
  constructor(@InjectModel(Student.name) private readonly studentModel: Model<Student>) {}

  async create(dto: CreateStudentDto): Promise<StudentDocument> {
    try { return await this.studentModel.create(dto); } catch (error) { this.throwDuplicate(error); }
  }

  async findAll(query: StudentsQuery = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const filter: FilterQuery<Student> = {};
    if (query.class) filter.class = query.class;
    if (query.section) filter.section = query.section;
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      const value = this.escapeRegex(query.search.trim());
      filter.$or = [{ firstName: { $regex: value, $options: 'i' } }, { lastName: { $regex: value, $options: 'i' } }, { rollNumber: { $regex: value, $options: 'i' } }, { admissionNumber: { $regex: value, $options: 'i' } }];
    }
    const [data, total] = await Promise.all([
      this.studentModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.studentModel.countDocuments(filter).exec(),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<StudentDocument> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) throw new NotFoundException(`Student ${id} was not found`);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentDocument> {
    try {
      const student = await this.studentModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
      if (!student) throw new NotFoundException(`Student ${id} was not found`);
      return student;
    } catch (error) { this.throwDuplicate(error); }
  }

  /** Soft deletion retains the student record and marks it inactive. */
  async remove(id: string): Promise<StudentDocument> { return this.update(id, { status: StudentStatus.INACTIVE }); }

  async findByClassSection(className: string, section: string): Promise<StudentDocument[]> {
    return this.studentModel.find({ class: className, section }).sort({ rollNumber: 1 }).exec();
  }

  private throwDuplicate(error: unknown): never {
    if ((error as { code?: number })?.code === 11000) {
      const fields = Object.keys((error as { keyPattern?: object }).keyPattern ?? {}).join(' or ');
      throw new ConflictException(`${fields || 'Student identifier'} already exists`);
    }
    throw error;
  }
  private escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}
