import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { DashboardService } from './dashboard.service';

const warningProperty = {
  type: 'array',
  description:
    'Upstream services that were unavailable or returned an error. Other fields remain usable partial data.',
  items: {
    type: 'string',
  },
  example: [],
};
const studentDashboardSchema: SchemaObject = {
  type: 'object', required: ['student', 'todaysClasses', 'attendancePercentage', 'averageGrade', 'assignmentsDueCount', 'nextAssignment', 'feeStatus', 'notices', 'booksIssued', 'transportInfo', 'certificatesIssued', 'warnings'],
  properties: {
    student: { nullable: true, description: 'Student-service record, including classId when available.', type: 'object', additionalProperties: true },
    todaysClasses: { type: 'array', description: 'Today’s timetable records for the student class.', items: { type: 'object', additionalProperties: true } },
    attendancePercentage: { nullable: true, type: 'number', example: 92.31 },
    averageGrade: { nullable: true, type: 'number', description: 'Performance-service overall average, falling back to examination-service results.', example: 81.25 },
    assignmentsDueCount: { type: 'integer', description: 'Assignments with a pending submission.', example: 2 },
    nextAssignment: { nullable: true, type: 'object', description: 'Earliest not-yet-due pending assignment.', additionalProperties: true },
    feeStatus: { nullable: true, type: 'array', description: 'Per-fee balance and status records from fee-service.', items: { type: 'object', additionalProperties: true } },
    booksIssued: { type: 'object', description: 'Current library loans only; returned books are excluded.', required: ['count', 'books'], properties: { count: { type: 'integer', example: 2 }, books: { type: 'array', items: { type: 'object', required: ['bookId', 'dueDate', 'status'], properties: { bookId: { type: 'string', example: '66b5d38acd65f26429ab4ce5' }, dueDate: { type: 'string', format: 'date-time', example: '2026-10-20T00:00:00.000Z' }, status: { type: 'string', enum: ['issued', 'overdue'] } } } } } },
    transportInfo: { nullable: true, type: 'object', description: 'Current bus allocation enriched with route and pickup time; null when no allocation exists.', properties: { routeName: { nullable: true, type: 'string', example: 'North Campus Route' }, stop: { type: 'string', example: 'Central Park' }, pickupTime: { nullable: true, type: 'string', example: '07:35' } } },
    certificatesIssued: { nullable: true, type: 'integer', description: 'Count of certificates issued to the student; certificate documents are deliberately excluded.', example: 3 },
    notices: { type: 'array', description: 'Active notices for the student’s role and class.', items: { type: 'object', additionalProperties: true } },
    warnings: warningProperty,
  },
};
const teacherDashboardSchema: SchemaObject = {
  type: 'object', required: ['todaysClasses', 'pendingGradingCount', 'pendingLeaveApprovals', 'warnings'],
  properties: {
    todaysClasses: { type: 'array', description: 'Today’s periods assigned to this teacher; each item includes classId.', items: { type: 'object', additionalProperties: true } },
    pendingGradingCount: { type: 'integer', description: 'Current assignment-service teacher-assignment proxy for grading workload.', example: 4 },
    pendingLeaveApprovals: { type: 'integer', description: 'Number of pending leave requests.', example: 3 },
    warnings: warningProperty,
  },
};
const adminDashboardSchema: SchemaObject = {
  type: 'object', required: ['totalStudents', 'totalTeachers', 'pendingAdmissions', 'pendingLeaveRequests', 'totalFeeCollectedThisMonth', 'totalPendingFees', 'totalBooksIssuedCurrently', 'totalStudentsAllocated', 'warnings'],
  properties: {
    totalStudents: { nullable: true, type: 'integer', example: 850 }, totalTeachers: { nullable: true, type: 'integer', example: 56 },
    pendingAdmissions: { nullable: true, type: 'integer', example: 14 }, pendingLeaveRequests: { nullable: true, type: 'integer', example: 3 },
    totalFeeCollectedThisMonth: { type: 'number', description: 'Global collection total. This is zero until fee-service exposes a global payment-summary endpoint.', example: 0 },
    totalPendingFees: { type: 'number', description: 'Sum of configured fee structure amounts available from fee-service.', example: 1250000 },
    totalBooksIssuedCurrently: { nullable: true, type: 'integer', description: 'Calculated from library book totalCopies minus availableCopies.', example: 73 },
    totalStudentsAllocated: { nullable: true, type: 'integer', description: 'Number of students with a current transport allocation.', example: 218 },
    warnings: warningProperty,
  },
};

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Aggregate a fault-tolerant student dashboard from upstream services' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Student dashboard including library loans, transport allocation, and certificate count. A 200 response can contain partial data; inspect warnings for failed upstream services.', schema: studentDashboardSchema })
  student(@Param('studentId') studentId: string) { return this.dashboardService.studentDashboard(studentId); }

  @Get('parent/:studentId')
  @ApiOperation({ summary: 'Aggregate the student dashboard for a parent (ownership enforcement is deferred to auth-service/gateway)' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Parent view has the same nested shape, including library loans, transport allocation, and certificate count, with graceful-degradation warnings.', schema: studentDashboardSchema })
  parent(@Param('studentId') studentId: string) { return this.dashboardService.studentDashboard(studentId); }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Aggregate today’s classes, grading workload, and pending leave approvals for a teacher' })
  @ApiParam({ name: 'teacherId', example: '66b5d38acd65f26429ab4ce2' })
  @ApiResponse({ status: 200, description: 'Teacher dashboard with partial data and warnings when a dependency is unavailable.', schema: teacherDashboardSchema })
  teacher(@Param('teacherId') teacherId: string) { return this.dashboardService.teacherDashboard(teacherId); }

  @Get('admin')
  @ApiOperation({ summary: 'Aggregate school-wide operational counts and fee indicators for administrators' })
  @ApiResponse({ status: 200, description: 'Admin dashboard including current library-loan and transport-allocation counts, with partial data and warnings when a dependency is unavailable.', schema: adminDashboardSchema })
  admin() { return this.dashboardService.adminDashboard(); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('dashboard')
  @ApiOperation({ summary: 'Check dashboard-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'dashboard-service' }; }
}
