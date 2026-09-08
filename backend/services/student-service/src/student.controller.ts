import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';

// TODO: verify JWT via API Gateway headers once auth-service exists
@ApiTags('Students')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may create students.' })
  @ApiOperation({ summary: 'Create a student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 409, description: 'Email or roll number already exists' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List active students, optionally by class or search term' })
  @ApiResponse({ status: 200, description: 'Students returned successfully' })
  findAll(@Query('classId') classId?: string, @Query('search') search?: string) {
    return this.studentService.findAll(classId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one active student for HTTP validation by other services' })
  @ApiResponse({ status: 200, description: 'Student returned successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may update students.' })
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Email or roll number already exists' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may delete students.' })
  @ApiOperation({ summary: 'Soft-delete a student' })
  @ApiResponse({ status: 200, description: 'Student marked inactive successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('student')
  @ApiOperation({ summary: 'Check student-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'student-service' };
  }
}
