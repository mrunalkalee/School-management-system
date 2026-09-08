import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherService } from './teacher.service';

// TODO: verify JWT via API Gateway headers once auth-service exists
@ApiTags('Teachers')
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may create teachers.' })
  @ApiOperation({ summary: 'Create a teacher' })
  @ApiResponse({ status: 201, description: 'Teacher created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  @ApiOperation({ summary: 'List active teachers, optionally filtered by a search term' })
  @ApiResponse({ status: 200, description: 'Teachers returned successfully' })
  findAll(@Query('search') search?: string) {
    return this.teacherService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one active teacher for HTTP validation by other services' })
  @ApiResponse({ status: 200, description: 'Teacher returned successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may update teachers.' })
  @ApiOperation({ summary: 'Update a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher updated successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may delete teachers.' })
  @ApiOperation({ summary: 'Soft-delete a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher marked inactive successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('teacher')
  @ApiOperation({ summary: 'Check teacher-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'teacher-service' };
  }
}
