import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTimetableDto, DayOfWeek } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { TimetableService } from './timetable.service';

// TODO: verify JWT via API Gateway headers once auth-service exists
@ApiTags('Timetable')
@Controller('timetables')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
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
  @ApiOperation({ summary: 'Update a timetable and validate changed references' })
  @ApiResponse({ status: 200, description: 'Timetable updated successfully' })
  @ApiResponse({ status: 404, description: 'Timetable, class, or teacher not found' })
  @ApiResponse({ status: 409, description: 'A timetable already exists for the class and day' })
  @ApiResponse({ status: 503, description: 'Class or teacher service unavailable' })
  update(@Param('id') id: string, @Body() updateTimetableDto: UpdateTimetableDto) {
    return this.timetableService.update(id, updateTimetableDto);
  }

  @Delete(':id')
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
