import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceService } from './attendance.service';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Bulk mark attendance, validating the class and every student' })
  @ApiResponse({ status: 201, description: 'Attendance records created or updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid attendance payload' })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  @ApiResponse({ status: 503, description: 'Class or student service unavailable' })
  mark(@Body() markAttendanceDto: MarkAttendanceDto) {
    return this.attendanceService.mark(markAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List attendance records, optionally filtered by class and date' })
  @ApiQuery({ name: 'classId', required: false, example: '66b5d38acd65f26429ab4ce2' })
  @ApiQuery({ name: 'date', required: false, example: '2026-09-03' })
  @ApiResponse({ status: 200, description: 'Attendance records returned successfully' })
  findAll(@Query('classId') classId?: string, @Query('date') date?: string) {
    return this.attendanceService.findAll(classId, date);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get a student attendance history and attendance percentage' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Stable student attendance history summary returned successfully' })
  findStudentHistory(@Param('studentId') studentId: string) {
    return this.attendanceService.findStudentHistory(studentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record status or manual marker' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce3' })
  @ApiResponse({ status: 200, description: 'Attendance record updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid attendance update payload' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('attendance')
  @ApiOperation({ summary: 'Check attendance-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'attendance-service' };
  }
}
