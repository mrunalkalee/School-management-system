import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './student.schema';

@Injectable()
export class StudentService {
  constructor(@InjectModel(Student.name) private readonly studentModel: Model<Student>) {}

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    try {
      return await this.studentModel.create(createStudentDto);
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async findAll(classId?: string, search?: string): Promise<StudentDocument[]> {
    const filter: FilterQuery<Student> = { isActive: true };
    if (classId) filter.classId = classId;
    if (search) {
      const expression = new RegExp(this.escapeRegex(search), 'i');
      filter.$or = [
        { firstName: expression },
        { lastName: expression },
        { rollNumber: expression },
      ];
    }
    return this.studentModel.find(filter).exec();
  }

  async findOne(id: string): Promise<StudentDocument> {
    this.assertValidId(id);
    const student = await this.studentModel.findOne({ _id: id, isActive: true }).exec();
    if (!student) throw new NotFoundException(`Student with ID ${id} was not found`);
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentDocument> {
    await this.findOne(id);
    try {
      const student = await this.studentModel
        .findByIdAndUpdate(id, updateStudentDto, { new: true, runValidators: true })
        .exec();
      if (!student) throw new NotFoundException(`Student with ID ${id} was not found`);
      return student;
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async remove(id: string): Promise<StudentDocument> {
    this.assertValidId(id);
    const student = await this.studentModel
      .findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true })
      .exec();
    if (!student) throw new NotFoundException(`Student with ID ${id} was not found`);
    return student;
  }

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException("Student with ID " + id + " was not found");
  }

  private handleDuplicateKey(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      const keyValue = 'keyValue' in error ? error.keyValue as Record<string, string> : {};
      const field = Object.keys(keyValue)[0] ?? 'unique field';
      throw new ConflictException(`A student with this ${field} already exists`);
    }
    throw error;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
