import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface AttendanceResponse {
  studentId: string;
  attendancePercentage: number;
}

interface ExaminationResult {
  exam: {
    subjectId: string;
    // Optional to preserve forward compatibility if examination-service later supplies a display name.
    subjectName?: string;
    examDate: string;
  };
  percentage: number;
}

interface ExaminationResponse {
  studentId: string;
  results: ExaminationResult[];
  overallAveragePercentage: number;
}

export interface SubjectWisePerformance {
  subjectId: string;
  subjectName: string;
  averagePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface StudentPerformanceResponse {
  studentId: string;
  subjectWisePerformance: SubjectWisePerformance[];
  attendancePercentage: number;
  overallAveragePercentage: number;
}

@Injectable()
export class PerformanceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findStudentPerformance(studentId: string): Promise<StudentPerformanceResponse> {
    try {
      const [attendance, examinations] = await Promise.all([
        this.remote<AttendanceResponse>(`${this.attendanceServiceUrl()}/student/${studentId}`),
        this.remote<ExaminationResponse>(`${this.examinationServiceUrl()}/results/student/${studentId}`),
      ]);

      return {
        studentId,
        subjectWisePerformance: this.summarizeSubjects(examinations.results),
        attendancePercentage: attendance.attendancePercentage,
        overallAveragePercentage: examinations.overallAveragePercentage,
      };
    } catch (error: unknown) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Unable to retrieve attendance or examination data');
    }
  }

  private summarizeSubjects(results: ExaminationResult[]): SubjectWisePerformance[] {
    const bySubject = new Map<string, ExaminationResult[]>();
    for (const result of results) {
      const subjectResults = bySubject.get(result.exam.subjectId) ?? [];
      subjectResults.push(result);
      bySubject.set(result.exam.subjectId, subjectResults);
    }

    return [...bySubject.entries()].map(([subjectId, subjectResults]) => {
      const chronological = [...subjectResults].sort(
        (left, right) => new Date(right.exam.examDate).getTime() - new Date(left.exam.examDate).getTime(),
      );
      const mostRecent = chronological[0].percentage;
      const previous = chronological[1]?.percentage;
      return {
        subjectId,
        // Examination-service currently owns subjectId only; use it as a stable display fallback.
        subjectName: chronological[0].exam.subjectName ?? subjectId,
        averagePercentage: Number((chronological.reduce((sum, result) => sum + result.percentage, 0) / chronological.length).toFixed(2)),
        trend: previous === undefined ? 'stable' : this.trend(mostRecent, previous),
      };
    }).sort((left, right) => left.subjectName.localeCompare(right.subjectName));
  }

  private trend(current: number, previous: number): 'up' | 'down' | 'stable' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  }

  private async remote<T>(url: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url));
      return response.data;
    } catch {
      throw new ServiceUnavailableException('Attendance or examination service is unavailable');
    }
  }

  private attendanceServiceUrl(): string {
    return this.configService.getOrThrow<string>('ATTENDANCE_SERVICE_URL');
  }

  private examinationServiceUrl(): string {
    return this.configService.getOrThrow<string>('EXAMINATION_SERVICE_URL');
  }
}
