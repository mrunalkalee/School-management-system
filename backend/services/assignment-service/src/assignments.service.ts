import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Assignment, AssignmentDocument } from './assignment.schema';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { Submission, SubmissionDocument, SubmissionStatus } from './submission.schema';

interface StudentRemote {
  _id: string;
  classId?: string;
}

export interface StudentAssignmentItem {
  assignment: AssignmentDocument;
  submission: SubmissionDocument | null;
  submissionStatus: SubmissionStatus;
}

export interface StudentAssignmentsResponse {
  studentId: string;
  classId: string | null;
  assignments: StudentAssignmentItem[];
}

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name) private readonly assignmentModel: Model<Assignment>,
    @InjectModel(Submission.name) private readonly submissionModel: Model<Submission>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<AssignmentDocument> {
    await this.remote(this.classServiceUrl(), createAssignmentDto.classId, 'Class');
    return new this.assignmentModel(createAssignmentDto).save();
  }

  async findAll(classId?: string, subjectId?: string): Promise<AssignmentDocument[]> {
    const filter: FilterQuery<Assignment> = {};
    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;
    return this.assignmentModel.find(filter).sort({ dueDate: 1, title: 1 }).exec();
  }

  async findOne(id: string): Promise<AssignmentDocument> {
    this.assertValidId(id, 'Assignment');
    const assignment = await this.assignmentModel.findById(id).exec();
    if (!assignment) throw new NotFoundException(`Assignment ${id} was not found`);
    return assignment;
  }

  async submit(assignmentId: string, submitAssignmentDto: SubmitAssignmentDto): Promise<SubmissionDocument> {
    const { studentId, ...submission } = submitAssignmentDto;
    await this.findOne(assignmentId);
    await this.remote(this.studentServiceUrl(), studentId, 'Student');
    return this.submissionModel.findOneAndUpdate(
      { assignmentId, studentId },
      {
        $set: {
          assignmentId,
          studentId,
          ...submission,
          submittedAt: new Date(),
          status: SubmissionStatus.Submitted,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async grade(submissionId: string, gradeSubmissionDto: GradeSubmissionDto): Promise<SubmissionDocument> {
    this.assertValidId(submissionId, 'Submission');
    const submission = await this.submissionModel.findByIdAndUpdate(
      submissionId,
      { $set: { ...gradeSubmissionDto, status: SubmissionStatus.Graded } },
      { new: true, runValidators: true },
    ).exec();
    if (!submission) throw new NotFoundException(`Submission ${submissionId} was not found`);
    return submission;
  }

  async findStudentAssignments(studentId: string): Promise<StudentAssignmentsResponse> {
    const student = await this.remote<StudentRemote>(this.studentServiceUrl(), studentId, 'Student');
    if (!student.classId) return { studentId, classId: null, assignments: [] };

    const assignments = await this.assignmentModel.find({ classId: student.classId }).sort({ dueDate: 1, title: 1 }).exec();
    const submissions = await this.submissionModel.find({ studentId, assignmentId: { $in: assignments.map((assignment) => assignment.id) } }).exec();
    const submissionsByAssignmentId = new Map(submissions.map((submission) => [submission.assignmentId, submission]));
    return {
      studentId,
      classId: student.classId,
      assignments: assignments.map((assignment) => {
        const submission = submissionsByAssignmentId.get(assignment.id) ?? null;
        return { assignment, submission, submissionStatus: submission?.status ?? SubmissionStatus.Pending };
      }),
    };
  }

  private async remote<T>(baseUrl: string, id: string, name: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(`${baseUrl}/${id}`));
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) throw new NotFoundException(`${name} ${id} was not found`);
      if (axios.isAxiosError(error) && !error.response) throw new ServiceUnavailableException(`Unable to reach ${name} service`);
      throw error;
    }
  }

  private classServiceUrl(): string { return this.configService.getOrThrow<string>('CLASS_SERVICE_URL'); }
  private studentServiceUrl(): string { return this.configService.getOrThrow<string>('STUDENT_SERVICE_URL'); }
  private assertValidId(id: string, name: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException(`${name} ${id} was not found`);
  }
}
