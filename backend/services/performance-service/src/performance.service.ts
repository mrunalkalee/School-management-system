import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
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
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findStudentPerformance(studentId: string): Promise<StudentPerformanceResponse> {
    const attendanceUrl = `${this.attendanceServiceUrl()}/student/${studentId}`;
    const examinationUrl = `${this.examinationServiceUrl()}/results/student/${studentId}`;
    const [attendance, examinations] = await Promise.all([
      this.remote<AttendanceResponse>('attendance', attendanceUrl),
      this.remote<ExaminationResponse>('examination', examinationUrl),
    ]);

    return {
      studentId,
      subjectWisePerformance: this.summarizeSubjects(examinations.results),
      attendancePercentage: attendance.attendancePercentage,
      overallAveragePercentage: examinations.overallAveragePercentage,
    };
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

  private async remote<T>(service: string, url: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url, { timeout: 10_000 }));
      return response.data;
    } catch (error: unknown) {
      const upstreamError = error as {
        code?: string;
        message?: string;
        response?: { status?: number; statusText?: string; data?: unknown };
      };
      const status = upstreamError.response?.status;
      const details = status
        ? `HTTP ${status} ${upstreamError.response?.statusText ?? ''}; response=${this.stringify(upstreamError.response?.data)}`
        : `code=${upstreamError.code ?? 'unknown'}; message=${upstreamError.message ?? String(error)}`;

      this.logger.error(`[${service}] GET ${url} failed: ${details}`);
      throw new ServiceUnavailableException(`${service} service request failed${status ? ` (HTTP ${status})` : ''}`);
    }
  }

  private stringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private attendanceServiceUrl(): string {
    return this.configService.getOrThrow<string>('ATTENDANCE_SERVICE_URL');
  }

  private examinationServiceUrl(): string {
    return this.configService.getOrThrow<string>('EXAMINATION_SERVICE_URL');
  }
}
