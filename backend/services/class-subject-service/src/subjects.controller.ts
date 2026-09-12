import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO: verify JWT via API Gateway headers once auth-service exists
@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may create subjects.' })
  @ApiOperation({ summary: 'Create a subject and validate its class' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'List subjects, optionally filtered by class ID' })
  @ApiResponse({ status: 200, description: 'Subjects returned successfully' })
  findAll(@Query('classId') classId?: string) {
    return this.subjectsService.findAll(classId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one subject' })
  @ApiResponse({ status: 200, description: 'Subject returned successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may update subjects.' })
  @ApiOperation({ summary: 'Update a subject' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({ status: 404, description: 'Subject or class not found' })
  @ApiResponse({ status: 409, description: 'Subject code already exists' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may delete subjects.' })
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
