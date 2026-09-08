import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type Json = Record<string, unknown>;

type Student = Json & {
  classId?: string;
};

type AssignmentItem = {
  assignment: Json;
  submissionStatus: string;
  submission: Json | null;
};

type StudentAssignments = {
  assignments: AssignmentItem[];
};

type Attendance = {
  attendancePercentage: number;
};

type Performance = {
  overallAveragePercentage: number;
};

type ExamResults = {
  overallAveragePercentage?: number;
  averagePercentage?: number;
};

type Fees = {
  fees: Array<{
    balance: number;
    status: string;
  }>;
};

type RouteTimetable = Json & {
  classId: string;
  periods: Array<
    Json & {
      teacherId: string;
    }
  >;
};

type LibraryIssue = Json & {
  bookId: string;
  dueDate: string;
  status: string;
};

type TransportAllocation = Json & {
  routeId: string;
  stopName: string;
};

type TransportRoute = Json & {
  _id?: string;
  id?: string;
  routeName: string;
  stops: Array<{ stopName: string; pickupTime: string }>;
};

type Book = Json & {
  totalCopies: number;
  availableCopies: number;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async studentDashboard(studentId: string): Promise<Json> {
    const warnings: string[] = [];

    const student = await this.safe<Student>(
      'student-service',
      () =>
        this.get<Student>(
          `${this.url('STUDENT_SERVICE_URL')}/${encodeURIComponent(studentId)}`,
        ),
      warnings,
    );

    const classId = student?.classId;

    const [
      timetables,
      attendance,
      performance,
      examResults,
      assignments,
      fees,
      notices,
      libraryIssues,
      transportAllocation,
      transportRoutes,
      certificates,
    ] = await Promise.all([
      classId
        ? this.safe<RouteTimetable[]>(
            'timetable-service',
            () =>
              this.get<RouteTimetable[]>(
                `${this.url(
                  'TIMETABLE_SERVICE_URL',
                )}?classId=${encodeURIComponent(
                  classId,
                )}&day=${todayName()}`,
              ),
            warnings,
          )
        : Promise.resolve<RouteTimetable[] | null>([]),

      this.safe<Attendance>(
        'attendance-service',
        () =>
          this.get<Attendance>(
            `${this.url(
              'ATTENDANCE_SERVICE_URL',
            )}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.safe<Performance>(
        'performance-service',
        () =>
          this.get<Performance>(
            `${this.url(
              'PERFORMANCE_SERVICE_URL',
            )}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.safe<ExamResults>(
        'examination-service',
        () =>
          this.get<ExamResults>(
            `${this.url(
              'EXAMINATION_SERVICE_URL',
            )}/exams/results/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.safe<StudentAssignments>(
        'assignment-service',
        () =>
          this.get<StudentAssignments>(
            `${this.url(
              'ASSIGNMENT_SERVICE_URL',
            )}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.safe<Fees>(
        'fee-service',
        () =>
          this.get<Fees>(
            `${this.url(
              'FEE_SERVICE_URL',
            )}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'notice-service',
        () =>
          this.get<Json[]>(
            `${this.url(
              'NOTICE_SERVICE_URL',
            )}?targetRole=student${
              classId
                ? `&classId=${encodeURIComponent(classId)}`
                : ''
            }`,
          ),
        warnings,
      ),

      this.safe<LibraryIssue[]>(
        'library-service',
        () =>
          this.get<LibraryIssue[]>(
            `${this.url('LIBRARY_SERVICE_URL')}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.optional<TransportAllocation>(
        'transport-service',
        () =>
          this.get<TransportAllocation>(
            `${this.url('TRANSPORT_SERVICE_URL')}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),

      this.safe<TransportRoute[]>(
        'transport-service',
        () =>
          this.get<TransportRoute[]>(
            `${this.url('TRANSPORT_SERVICE_URL')}/routes`,
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'certificate-service',
        () =>
          this.get<Json[]>(
            `${this.url('CERTIFICATE_SERVICE_URL')}/student/${encodeURIComponent(studentId)}`,
          ),
        warnings,
      ),
    ]);

    const assignmentItems = assignments?.assignments ?? [];

    const due = assignmentItems.filter(
      (item) => item.submissionStatus === 'pending',
    );

    const nextAssignment =
      due
        .map((item) => item.assignment)
        .filter(
          (assignment) =>
            new Date(String(assignment.dueDate)).getTime() >= Date.now(),
        )
      .sort(
          (a, b) =>
            new Date(String(a.dueDate)).getTime() -
            new Date(String(b.dueDate)).getTime(),
      )[0] ?? null;

    const issuedBooks = (libraryIssues ?? [])
      .filter((issue) => issue.status === 'issued' || issue.status === 'overdue')
      .map((issue) => ({
        bookId: issue.bookId,
        dueDate: issue.dueDate,
        status: issue.status,
      }));

    const route = transportRoutes?.find(
      (candidate) => (candidate._id ?? candidate.id) === transportAllocation?.routeId,
    );
    const stop = route?.stops.find(
      (candidate) => candidate.stopName.toLocaleLowerCase() === transportAllocation?.stopName.toLocaleLowerCase(),
    );

    return {
      student: student ?? null,
      todaysClasses: timetables ?? [],
      attendancePercentage: attendance?.attendancePercentage ?? null,

      averageGrade:
        performance?.overallAveragePercentage ??
        examResults?.overallAveragePercentage ??
        examResults?.averagePercentage ??
        null,

      assignmentsDueCount: due.length,
      nextAssignment,
      feeStatus: fees?.fees ?? null,
      notices: notices ?? [],
      booksIssued: { count: issuedBooks.length, books: issuedBooks },
      transportInfo: transportAllocation
        ? {
            routeName: route?.routeName ?? null,
            stop: transportAllocation.stopName,
            pickupTime: stop?.pickupTime ?? null,
          }
        : null,
      certificatesIssued: certificates?.length ?? null,
      warnings,
    };
  }

  async teacherDashboard(teacherId: string): Promise<Json> {
    const warnings: string[] = [];

    const [timetables, assignments, leaves] = await Promise.all([
      this.safe<RouteTimetable[]>(
        'timetable-service',
        () =>
          this.get<RouteTimetable[]>(
            `${this.url(
              'TIMETABLE_SERVICE_URL',
            )}?day=${todayName()}`,
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'assignment-service',
        () =>
          this.get<Json[]>(
            this.url('ASSIGNMENT_SERVICE_URL'),
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'leave-service',
        () =>
          this.get<Json[]>(
            `${this.url('LEAVE_SERVICE_URL')}?status=pending`,
          ),
        warnings,
      ),
    ]);

    const todaysClasses = (timetables ?? []).flatMap((timetable) =>
      timetable.periods
        .filter((period) => period.teacherId === teacherId)
        .map((period) => ({
          ...period,
          classId: timetable.classId,
        })),
    );

    const pendingGradingCount = (assignments ?? []).filter(
      (assignment) => assignment.teacherId === teacherId,
    ).length;

    return {
      todaysClasses,
      pendingGradingCount,
      pendingLeaveApprovals: (leaves ?? []).length,
      warnings,
    };
  }

  async adminDashboard(): Promise<Json> {
    const warnings: string[] = [];

    const [
      students,
      teachers,
      admissions,
      leaves,
      feeStructures,
      books,
      transportAllocations,
    ] = await Promise.all([
      this.safe<Json[]>(
        'student-service',
        () =>
          this.get<Json[]>(
            this.url('STUDENT_SERVICE_URL'),
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'teacher-service',
        () =>
          this.get<Json[]>(
            this.url('TEACHER_SERVICE_URL'),
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'admission-service',
        () =>
          this.get<Json[]>(
            `${this.url(
              'ADMISSION_SERVICE_URL',
            )}?status=pending`,
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'leave-service',
        () =>
          this.get<Json[]>(
            `${this.url(
              'LEAVE_SERVICE_URL',
            )}?status=pending`,
          ),
        warnings,
      ),

      this.safe<Array<Json & { amount: number }>>(
        'fee-service',
        () =>
          this.get<Array<Json & { amount: number }>>(
            `${this.url('FEE_SERVICE_URL')}/structures`,
          ),
        warnings,
      ),

      this.safe<Book[]>(
        'library-service',
        () =>
          this.get<Book[]>(
            `${this.url('LIBRARY_SERVICE_URL')}/books`,
          ),
        warnings,
      ),

      this.safe<Json[]>(
        'transport-service',
        () =>
          this.get<Json[]>(
            `${this.url('TRANSPORT_SERVICE_URL')}/allocations`,
          ),
        warnings,
      ),
    ]);

    const totalPendingFees = (feeStructures ?? []).reduce(
      (sum, structure) => sum + Number(structure.amount ?? 0),
      0,
    );
    const totalBooksIssuedCurrently = books?.reduce(
      (sum, book) => sum + Math.max(0, Number(book.totalCopies) - Number(book.availableCopies)),
      0,
    ) ?? null;

    return {
      totalStudents: students?.length ?? null,
      totalTeachers: teachers?.length ?? null,
      pendingAdmissions: admissions?.length ?? null,
      pendingLeaveRequests: leaves?.length ?? null,

      totalFeeCollectedThisMonth: 0,

      totalPendingFees,

      totalBooksIssuedCurrently,
      totalStudentsAllocated: transportAllocations?.length ?? null,

      warnings,
    };
  }

  private async get<T>(url: string): Promise<T> {
    console.log(`➡️ Calling URL: ${url}`);

    return (
      await firstValueFrom(
        this.httpService.get<T>(url),
      )
    ).data;
  }

  private async safe<T>(
    service: string,
    request: () => Promise<T>,
    warnings: string[],
  ): Promise<T | null> {
    try {
      return await request();
    } catch (error: any) {
      console.error('\n========================================');
      console.error(`❌ ERROR CALLING: ${service}`);
      console.error('========================================');

      console.error('Message:', error.message);
      console.error('Code:', error.code ?? 'N/A');
      console.error(
        'HTTP Status:',
        error.response?.status ?? 'No HTTP response',
      );
      console.error(
        'Response Data:',
        error.response?.data ?? 'No response data',
      );

      console.error('========================================\n');

      warnings.push(
        `${service} was unreachable or returned an error`,
      );

      return null;
    }
  }

  private async optional<T>(
    service: string,
    request: () => Promise<T>,
    warnings: string[],
  ): Promise<T | null> {
    try {
      return await request();
    } catch (error: unknown) {
      if (hasStatus(error, 404)) return null;
      warnings.push(`${service} was unreachable or returned an error`);
      return null;
    }
  }

  private url(name: string): string {
    return this.config
      .getOrThrow<string>(name)
      .replace(/\/$/, '');
  }
}

function hasStatus(error: unknown, status: number): boolean {
  return typeof error === 'object' && error !== null && 'response' in error &&
    typeof error.response === 'object' && error.response !== null &&
    'status' in error.response && error.response.status === status;
}

function todayName(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
  }).format(new Date());
}
