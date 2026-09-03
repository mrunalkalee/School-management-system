import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateExamDto, UpdateExamDto } from './dto/create-exam.dto';
import { EnterMarksDto } from './dto/enter-marks.dto';
import { Exam, ExamDocument } from './exam.schema';
import { Marks, MarksDocument } from './marks.schema';

export interface StudentExamResult {
  exam: ExamDocument;
  marks: MarksDocument;
  percentage: number;
}

export interface StudentResultsResponse {
  studentId: string;
  results: StudentExamResult[];
  overallAveragePercentage: number;
}

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name) private readonly examModel: Model<Exam>,
    @InjectModel(Marks.name) private readonly marksModel: Model<Marks>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createExamDto: CreateExamDto): Promise<ExamDocument> {
    await this.remote(this.classServiceUrl(), createExamDto.classId, 'Class');
    return new this.examModel(createExamDto).save();
  }

  async findAll(classId?: string, subjectId?: string): Promise<ExamDocument[]> {
    const filter: FilterQuery<Exam> = {};
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    return this.examModel.find(filter).sort({ examDate: -1, name: 1 }).exec();
  }

  async findOne(id: string): Promise<ExamDocument> {
    this.assertValidId(id, 'Exam');
    const exam = await this.examModel.findById(id).exec();
    if (!exam) throw new NotFoundException(`Exam ${id} was not found`);
    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<ExamDocument> {
    await this.findOne(id);
    if (updateExamDto.classId) await this.remote(this.classServiceUrl(), updateExamDto.classId, 'Class');
    const exam = await this.examModel.findByIdAndUpdate(id, updateExamDto, { new: true, runValidators: true }).exec();
    if (!exam) throw new NotFoundException(`Exam ${id} was not found`);
    return exam;
  }

  async enterMarks(examId: string, enterMarksDto: EnterMarksDto): Promise<MarksDocument[]> {
    const exam = await this.findOne(examId);
    for (const mark of enterMarksDto.marks) {
      if (mark.marksObtained > exam.maxMarks) {
        throw new BadRequestException(`marksObtained cannot exceed maxMarks (${exam.maxMarks})`);
      }
    }
    await Promise.all(enterMarksDto.marks.map((mark) => this.remote(this.studentServiceUrl(), mark.studentId, 'Student')));

    return Promise.all(enterMarksDto.marks.map((mark) => this.marksModel.findOneAndUpdate(
      { examId, studentId: mark.studentId },
      {
        $set: {
          examId,
          studentId: mark.studentId,
          marksObtained: mark.marksObtained,
          grade: computeGrade(mark.marksObtained, exam.maxMarks),
          ...(mark.remarks === undefined ? {} : { remarks: mark.remarks }),
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec()));
  }

  async findStudentResults(studentId: string): Promise<StudentResultsResponse> {
    const marks = await this.marksModel.find({ studentId }).sort({ createdAt: -1 }).exec();
    const exams = await this.examModel.find({ _id: { $in: marks.map((mark) => mark.examId) } }).exec();
    const examsById = new Map(exams.map((exam) => [exam.id, exam]));
    const results = marks
      .map((mark) => {
        const exam = examsById.get(mark.examId);
        return exam ? { exam, marks: mark, percentage: percentage(mark.marksObtained, exam.maxMarks) } : undefined;
      })
      .filter((result): result is StudentExamResult => result !== undefined)
      .sort((left, right) => right.exam.examDate.getTime() - left.exam.examDate.getTime());

    return {
      studentId,
      results,
      overallAveragePercentage: results.length === 0
        ? 0
        : Number((results.reduce((total, result) => total + result.percentage, 0) / results.length).toFixed(2)),
    };
  }

  private classServiceUrl(): string {
    return this.configService.getOrThrow<string>('CLASS_SERVICE_URL');
  }

  private studentServiceUrl(): string {
    return this.configService.getOrThrow<string>('STUDENT_SERVICE_URL');
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

  private assertValidId(id: string, entityName: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException(`${entityName} ${id} was not found`);
  }
}

export function computeGrade(marksObtained: number, maxMarks: number): string {
  const scorePercentage = percentage(marksObtained, maxMarks);
  if (scorePercentage >= 90) return 'A+';
  if (scorePercentage >= 75) return 'A';
  if (scorePercentage >= 60) return 'B';
  if (scorePercentage >= 40) return 'C';
  return 'F';
}

function percentage(marksObtained: number, maxMarks: number): number {
  return Number(((marksObtained / maxMarks) * 100).toFixed(2));
}
