import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { PerformanceService } from './performance.service';

const studentPerformanceSchema: SchemaObject = {
  type: 'object',
  required: ['studentId', 'subjectWisePerformance', 'attendancePercentage', 'overallAveragePercentage'],
  properties: {
    studentId: { type: 'string', example: '66b5d38acd65f26429ab4ce1' },
    subjectWisePerformance: {
      type: 'array',
      items: {
        type: 'object',
        required: ['subjectId', 'subjectName', 'averagePercentage', 'trend'],
        properties: {
          subjectId: { type: 'string', example: '66b5d38acd65f26429ab4ce3' },
          subjectName: { type: 'string', example: 'Mathematics' },
          averagePercentage: { type: 'number', format: 'float', example: 82.5 },
          trend: { type: 'string', enum: ['up', 'down', 'stable'], example: 'up' },
        },
      },
    },
    attendancePercentage: { type: 'number', format: 'float', example: 92.31 },
    overallAveragePercentage: { type: 'number', format: 'float', example: 81.25 },
  },
};

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Aggregate a student’s attendance and subject-wise examination performance' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Stable aggregated student performance response', schema: studentPerformanceSchema })
  @ApiResponse({ status: 503, description: 'Attendance-service or examination-service is unavailable' })
  findStudentPerformance(@Param('studentId') studentId: string) {
    return this.performanceService.findStudentPerformance(studentId);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('performance')
  @ApiOperation({ summary: 'Check performance-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'performance-service' }; }
}
