import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ClassesService } from './classes.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject, SubjectDocument } from './subject.schema';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private readonly subjectModel: Model<Subject>,
    private readonly classesService: ClassesService,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<SubjectDocument> {
    await this.classesService.findOne(createSubjectDto.classId);
    try {
      return await this.subjectModel.create(createSubjectDto);
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async findAll(classId?: string): Promise<SubjectDocument[]> {
    return this.subjectModel.find(classId ? { classId } : {}).exec();
  }

  async findOne(id: string): Promise<SubjectDocument> {
    this.assertValidId(id);
    const subject = await this.subjectModel.findById(id).exec();
    if (!subject) throw new NotFoundException(`Subject ${id} was not found`);
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<SubjectDocument> {
    await this.findOne(id);
    if (updateSubjectDto.classId) await this.classesService.findOne(updateSubjectDto.classId);
    try {
      const subject = await this.subjectModel
        .findByIdAndUpdate(id, updateSubjectDto, { new: true, runValidators: true })
        .exec();
      if (!subject) throw new NotFoundException(`Subject ${id} was not found`);
      return subject;
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async remove(id: string): Promise<SubjectDocument> {
    this.assertValidId(id);
    const subject = await this.subjectModel.findByIdAndDelete(id).exec();
    if (!subject) throw new NotFoundException(`Subject ${id} was not found`);
    return subject;
  }

  private handleDuplicateKey(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      throw new ConflictException('A subject with this code already exists');
    }
    throw error;
  }

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException(`Subject ${id} was not found`);
  }
}
