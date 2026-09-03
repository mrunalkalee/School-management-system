import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateTimetableDto, PeriodDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { Timetable, TimetableDocument } from './timetable.schema';

@Injectable()
export class TimetableService {
  constructor(
    @InjectModel(Timetable.name) private readonly timetableModel: Model<Timetable>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createTimetableDto: CreateTimetableDto): Promise<TimetableDocument> {
    await this.validateReferences(createTimetableDto.classId, createTimetableDto.periods);
    try {
      return await this.timetableModel.create(createTimetableDto);
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async findAll(classId?: string, day?: string): Promise<TimetableDocument[]> {
    const filter: FilterQuery<Timetable> = {};
    if (classId) filter.classId = classId;
    if (day) filter.dayOfWeek = day;
    return this.timetableModel.find(filter).sort({ dayOfWeek: 1 }).exec();
  }

  async findOne(id: string): Promise<TimetableDocument> {
    this.assertValidId(id);
    const timetable = await this.timetableModel.findById(id).exec();
    if (!timetable) throw new NotFoundException(`Timetable ${id} was not found`);
    return timetable;
  }

  async update(id: string, updateTimetableDto: UpdateTimetableDto): Promise<TimetableDocument> {
    await this.findOne(id);
    if (updateTimetableDto.classId || updateTimetableDto.periods) {
      await this.validateReferences(updateTimetableDto.classId, updateTimetableDto.periods);
    }
    try {
      const timetable = await this.timetableModel
        .findByIdAndUpdate(id, updateTimetableDto, { new: true, runValidators: true })
        .exec();
      if (!timetable) throw new NotFoundException(`Timetable ${id} was not found`);
      return timetable;
    } catch (error: unknown) {
      this.handleDuplicateKey(error);
    }
  }

  async remove(id: string): Promise<TimetableDocument> {
    this.assertValidId(id);
    const timetable = await this.timetableModel.findByIdAndDelete(id).exec();
    if (!timetable) throw new NotFoundException(`Timetable ${id} was not found`);
    return timetable;
  }

  private async validateReferences(classId?: string, periods?: PeriodDto[]): Promise<void> {
    const validations: Promise<unknown>[] = [];
    if (classId) {
      validations.push(
        this.remote(
          this.configService.getOrThrow<string>('CLASS_SERVICE_URL'),
          classId,
          'Class',
        ),
      );
    }
    if (periods) {
      const teacherServiceUrl = this.configService.getOrThrow<string>('TEACHER_SERVICE_URL');
      validations.push(...periods.map((period) => this.remote(teacherServiceUrl, period.teacherId, 'Teacher')));
    }
    await Promise.all(validations);
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
    if (!isValidObjectId(id)) throw new NotFoundException(`Timetable ${id} was not found`);
  }

  private handleDuplicateKey(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      throw new ConflictException('A timetable already exists for this class and day');
    }
    throw error;
  }
}
