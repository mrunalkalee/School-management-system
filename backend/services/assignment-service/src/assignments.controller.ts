import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an assignment after validating its class' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid assignment payload' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 503, description: 'Class service unavailable' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) { return this.assignmentsService.create(createAssignmentDto); }

  @Get()
  @ApiOperation({ summary: 'List assignments, optionally filtered by class and subject' })
  @ApiQuery({ name: 'classId', required: false, example: '66b5d38acd65f26429ab4ce2' })
  @ApiQuery({ name: 'subjectId', required: false, example: '66b5d38acd65f26429ab4ce3' })
  @ApiResponse({ status: 200, description: 'Assignments returned successfully' })
  findAll(@Query('classId') classId?: string, @Query('subjectId') subjectId?: string) {
    return this.assignmentsService.findAll(classId, subjectId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get every assignment for a student’s class, joined with submission status' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Stable student assignment dashboard response returned successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  findStudentAssignments(@Param('studentId') studentId: string) {
    return this.assignmentsService.findStudentAssignments(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one assignment' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Assignment returned successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id') id: string) { return this.assignmentsService.findOne(id); }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Create or update a student submission after validating the student' })
  @ApiParam({ name: 'id', description: 'Assignment ID', example: '66b5d38acd65f26429ab4ce5' })
  @ApiBody({ type: SubmitAssignmentDto })
  @ApiResponse({ status: 201, description: 'Submission created or updated successfully' })
  @ApiResponse({ status: 404, description: 'Assignment or student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  submit(@Param('id') id: string, @Body() submitAssignmentDto: SubmitAssignmentDto) {
    return this.assignmentsService.submit(id, submitAssignmentDto);
  }
}

@ApiTags('Assignments')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Patch(':id/grade')
  @ApiOperation({ summary: 'Grade a submission and optionally leave feedback' })
  @ApiParam({ name: 'id', description: 'Submission ID', example: '66b5d38acd65f26429ab4ce6' })
  @ApiResponse({ status: 200, description: 'Submission graded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid grading payload' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  grade(@Param('id') id: string, @Body() gradeSubmissionDto: GradeSubmissionDto) {
    return this.assignmentsService.grade(id, gradeSubmissionDto);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('assignment')
  @ApiOperation({ summary: 'Check assignment-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'assignment-service' }; }
}
