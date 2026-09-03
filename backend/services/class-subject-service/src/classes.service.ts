import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { SchoolClass, SchoolClassDocument } from './class.schema';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(SchoolClass.name) private readonly classModel: Model<SchoolClass>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<SchoolClassDocument> {
    await this.remote(
      this.configService.getOrThrow<string>('TEACHER_SERVICE_URL'),
      createClassDto.classTeacherId,
      'Teacher',
    );
    return this.classModel.create(createClassDto);
  }

  async findAll(): Promise<SchoolClassDocument[]> {
    return this.classModel.find().exec();
  }

  async findOne(id: string): Promise<SchoolClassDocument> {
    this.assertValidId(id);
    const schoolClass = await this.classModel.findById(id).exec();
    if (!schoolClass) throw new NotFoundException(`Class ${id} was not found`);
    return schoolClass;
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<SchoolClassDocument> {
    await this.findOne(id);
    if (updateClassDto.classTeacherId) {
      await this.remote(
        this.configService.getOrThrow<string>('TEACHER_SERVICE_URL'),
        updateClassDto.classTeacherId,
        'Teacher',
      );
    }
    const schoolClass = await this.classModel
      .findByIdAndUpdate(id, updateClassDto, { new: true, runValidators: true })
      .exec();
    if (!schoolClass) throw new NotFoundException(`Class ${id} was not found`);
    return schoolClass;
  }

  async remove(id: string): Promise<SchoolClassDocument> {
    this.assertValidId(id);
    const schoolClass = await this.classModel.findByIdAndDelete(id).exec();
    if (!schoolClass) throw new NotFoundException(`Class ${id} was not found`);
    return schoolClass;
  }

  async assignStudents(id: string, { studentIds }: AssignStudentsDto): Promise<SchoolClassDocument> {
    const schoolClass = await this.findOne(id);
    const studentServiceUrl = this.configService.getOrThrow<string>('STUDENT_SERVICE_URL');
    await Promise.all(studentIds.map((studentId) => this.remote(studentServiceUrl, studentId, 'Student')));

    schoolClass.studentIds = [...new Set([...schoolClass.studentIds, ...studentIds])];
    return schoolClass.save();
  }

  private async remote<T>(baseUrl: string, id: string, name: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(`${baseUrl}/${id}`));
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException(`${name} ${id} was not found`);
      }
      if (axios.isAxiosError(error) && !error.response) {
        throw new ServiceUnavailableException(`Unable to reach ${name} service`);
      }
      throw error;
    }
  }

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException(`Class ${id} was not found`);
  }
}
