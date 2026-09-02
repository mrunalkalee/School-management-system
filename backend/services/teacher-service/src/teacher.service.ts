import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher, TeacherDocument } from './teacher.schema';

@Injectable()
export class TeacherService {
  constructor(@InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<TeacherDocument> {
    try {
      return await this.teacherModel.create(createTeacherDto);
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async findAll(search?: string): Promise<TeacherDocument[]> {
    const filter: FilterQuery<Teacher> = { isActive: true };
    if (search) {
      const expression = new RegExp(this.escapeRegex(search), 'i');
      filter.$or = [
        { firstName: expression },
        { lastName: expression },
        { email: expression },
        { subjectsHandled: expression },
      ];
    }
    return this.teacherModel.find(filter).exec();
  }

  async findOne(id: string): Promise<TeacherDocument> {
    this.assertValidId(id);
    const teacher = await this.teacherModel.findOne({ _id: id, isActive: true }).exec();
    if (!teacher) throw new NotFoundException(`Teacher with ID ${id} was not found`);
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<TeacherDocument> {
    await this.findOne(id);
    try {
      const teacher = await this.teacherModel
        .findByIdAndUpdate(id, updateTeacherDto, { new: true, runValidators: true })
        .exec();
      if (!teacher) throw new NotFoundException(`Teacher with ID ${id} was not found`);
      return teacher;
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async remove(id: string): Promise<TeacherDocument> {
    this.assertValidId(id);
    const teacher = await this.teacherModel
      .findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true })
      .exec();
    if (!teacher) throw new NotFoundException(`Teacher with ID ${id} was not found`);
    return teacher;
  }

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException(`Teacher with ID ${id} was not found`);
  }

  private handleDuplicateKey(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      const keyValue = 'keyValue' in error ? error.keyValue as Record<string, string> : {};
      const field = Object.keys(keyValue)[0] ?? 'email';
      throw new ConflictException(`A teacher with this ${field} already exists`);
    }
    throw error;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
