import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTimetableDto, DayOfWeek } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { TimetableService } from './timetable.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO: verify JWT via API Gateway headers once auth-service exists
@ApiTags('Timetable')
@Controller('timetables')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may create timetables.' })
  @ApiOperation({ summary: 'Create a timetable and validate its class and teachers' })
  @ApiResponse({ status: 201, description: 'Timetable created successfully' })
  @ApiResponse({ status: 404, description: 'Class or teacher not found' })
  @ApiResponse({ status: 409, description: 'A timetable already exists for the class and day' })
  @ApiResponse({ status: 503, description: 'Class or teacher service unavailable' })
  create(@Body() createTimetableDto: CreateTimetableDto) {
    return this.timetableService.create(createTimetableDto);
  }

  @Get()
  @ApiOperation({ summary: 'List timetables, optionally filtered by class and day' })
  @ApiQuery({ name: 'classId', required: false, example: '66b5d38acd65f26429ab4ce1' })
  @ApiQuery({ name: 'day', required: false, enum: DayOfWeek })
  @ApiResponse({ status: 200, description: 'Timetables returned successfully' })
  findAll(@Query('classId') classId?: string, @Query('day') day?: string) {
    return this.timetableService.findAll(classId, day);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one timetable' })
  @ApiResponse({ status: 200, description: 'Timetable returned successfully' })
  @ApiResponse({ status: 404, description: 'Timetable not found' })
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may update timetables.' })
  @ApiOperation({ summary: 'Update a timetable and validate changed references' })
  @ApiResponse({ status: 200, description: 'Timetable updated successfully' })
  @ApiResponse({ status: 404, description: 'Timetable, class, or teacher not found' })
  @ApiResponse({ status: 409, description: 'A timetable already exists for the class and day' })
  @ApiResponse({ status: 503, description: 'Class or teacher service unavailable' })
  update(@Param('id') id: string, @Body() updateTimetableDto: UpdateTimetableDto) {
    return this.timetableService.update(id, updateTimetableDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may delete timetables.' })
  @ApiOperation({ summary: 'Delete a timetable' })
  @ApiResponse({ status: 200, description: 'Timetable deleted successfully' })
  @ApiResponse({ status: 404, description: 'Timetable not found' })
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('timetable')
  @ApiOperation({ summary: 'Check timetable-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'timetable-service' };
  }
}
