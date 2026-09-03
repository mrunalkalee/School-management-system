import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExamDto, UpdateExamDto } from './dto/create-exam.dto';
import { EnterMarksDto } from './dto/enter-marks.dto';
import { ExamsService } from './exams.service';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Examinations')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an examination or online test after validating its class' })
  @ApiResponse({ status: 201, description: 'Exam created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid exam payload' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 503, description: 'Class service unavailable' })
  create(@Body() createExamDto: CreateExamDto) { return this.examsService.create(createExamDto); }

  @Get()
  @ApiOperation({ summary: 'List exams, optionally filtered by class and subject' })
  @ApiQuery({ name: 'classId', required: false, example: '66b5d38acd65f26429ab4ce2' })
  @ApiQuery({ name: 'subjectId', required: false, example: '66b5d38acd65f26429ab4ce3' })
  @ApiResponse({ status: 200, description: 'Exams returned successfully' })
  findAll(@Query('classId') classId?: string, @Query('subjectId') subjectId?: string) {
    return this.examsService.findAll(classId, subjectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one exam' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce4' })
  @ApiResponse({ status: 200, description: 'Exam returned successfully' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  findOne(@Param('id') id: string) { return this.examsService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exam' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce4' })
  @ApiResponse({ status: 200, description: 'Exam updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update payload' })
  @ApiResponse({ status: 404, description: 'Exam or class not found' })
  @ApiResponse({ status: 503, description: 'Class service unavailable' })
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(id, updateExamDto);
  }

  @Post(':id/marks')
  @ApiOperation({ summary: 'Bulk upsert marks for an exam and automatically compute grades' })
  @ApiParam({ name: 'id', description: 'Exam ID', example: '66b5d38acd65f26429ab4ce4' })
  @ApiBody({ type: EnterMarksDto })
  @ApiResponse({ status: 201, description: 'Marks created or updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid marks payload' })
  @ApiResponse({ status: 404, description: 'Exam or student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  enterMarks(@Param('id') id: string, @Body() enterMarksDto: EnterMarksDto) {
    return this.examsService.enterMarks(id, enterMarksDto);
  }

  @Get('/results/student/:studentId')
  @ApiOperation({ summary: 'Get a stable exam-results summary for a student' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Student results, per-exam percentages, and overall average returned successfully' })
  findStudentResults(@Param('studentId') studentId: string) {
    return this.examsService.findStudentResults(studentId);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('examination')
  @ApiOperation({ summary: 'Check examination-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'examination-service' }; }
}
