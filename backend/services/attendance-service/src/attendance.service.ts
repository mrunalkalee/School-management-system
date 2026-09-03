import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance, AttendanceDocument, AttendanceStatus } from './attendance.schema';

export interface StudentAttendanceHistory {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercentage: number;
  records: AttendanceDocument[];
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private readonly attendanceModel: Model<Attendance>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async mark(markAttendanceDto: MarkAttendanceDto): Promise<AttendanceDocument[]> {
    await this.validateReferences(markAttendanceDto.classId, markAttendanceDto.records.map((record) => record.studentId));

    return Promise.all(markAttendanceDto.records.map((record) => {
      const update: Partial<Attendance> = {
        studentId: record.studentId,
        classId: markAttendanceDto.classId,
        date: markAttendanceDto.date,
        status: record.status,
      };
      if (markAttendanceDto.markedBy !== undefined) update.markedBy = markAttendanceDto.markedBy;

      return this.attendanceModel
        .findOneAndUpdate(
          { studentId: record.studentId, date: markAttendanceDto.date },
          { $set: update },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
        )
        .exec();
    }));
  }

  async findAll(classId?: string, date?: string): Promise<AttendanceDocument[]> {
    const filter: FilterQuery<Attendance> = {};
    if (classId) filter.classId = classId;
    if (date) filter.date = date;
    return this.attendanceModel.find(filter).sort({ date: -1, studentId: 1 }).exec();
  }

  async findStudentHistory(studentId: string): Promise<StudentAttendanceHistory> {
    const records = await this.attendanceModel.find({ studentId }).sort({ date: -1 }).exec();
    const presentDays = records.filter((record) => record.status === AttendanceStatus.Present).length;
    const absentDays = records.filter((record) => record.status === AttendanceStatus.Absent).length;
    const leaveDays = records.filter((record) => record.status === AttendanceStatus.Leave).length;
    const totalDays = records.length;

    return {
      studentId,
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      attendancePercentage: totalDays === 0 ? 0 : Number(((presentDays / totalDays) * 100).toFixed(2)),
      records,
    };
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<AttendanceDocument> {
    this.assertValidId(id);
    const attendance = await this.attendanceModel
      .findByIdAndUpdate(id, updateAttendanceDto, { new: true, runValidators: true })
      .exec();
    if (!attendance) throw new NotFoundException(`Attendance record ${id} was not found`);
    return attendance;
  }

  private async validateReferences(classId: string, studentIds: string[]): Promise<void> {
    const classServiceUrl = this.configService.getOrThrow<string>('CLASS_SERVICE_URL');
    const studentServiceUrl = this.configService.getOrThrow<string>('STUDENT_SERVICE_URL');
    await Promise.all([
      this.remote(classServiceUrl, classId, 'Class'),
      ...studentIds.map((studentId) => this.remote(studentServiceUrl, studentId, 'Student')),
    ]);
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
    if (!isValidObjectId(id)) throw new NotFoundException(`Attendance record ${id} was not found`);
  }
}
