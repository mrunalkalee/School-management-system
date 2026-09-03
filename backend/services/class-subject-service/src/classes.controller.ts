import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassesService } from './classes.service';

// TODO: verify JWT via API Gateway headers once auth-service exists
@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a class and validate its class teacher' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({ status: 503, description: 'Teacher service unavailable' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'List classes' })
  @ApiResponse({ status: 200, description: 'Classes returned successfully' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one class' })
  @ApiResponse({ status: 200, description: 'Class returned successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class or teacher not found' })
  @ApiResponse({ status: 503, description: 'Teacher service unavailable' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  @Post(':id/assign-students')
  @ApiOperation({ summary: 'Validate and assign students to a class' })
  @ApiResponse({ status: 201, description: 'Students assigned successfully' })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  assignStudents(@Param('id') id: string, @Body() assignStudentsDto: AssignStudentsDto) {
    return this.classesService.assignStudents(id, assignStudentsDto);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('class-subject')
  @ApiOperation({ summary: 'Check class-subject-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'class-subject-service' };
  }
}
