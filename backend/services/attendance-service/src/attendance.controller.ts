import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, GatewayUser } from './current-user.decorator';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AttendanceService } from './attendance.service';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'teacher')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification; used as markedBy when x-user-role is present.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin and teacher may mark attendance.' })
  @ApiOperation({ summary: 'Bulk mark attendance, validating the class and every student' })
  @ApiResponse({ status: 201, description: 'Attendance records created or updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid attendance payload' })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  @ApiResponse({ status: 503, description: 'Class or student service unavailable' })
  mark(@Body() markAttendanceDto: MarkAttendanceDto, @CurrentUser() currentUser: GatewayUser) {
    if (!currentUser.role) return this.attendanceService.mark(markAttendanceDto);

    const { markedBy: _manualMarkedBy, ...attendance } = markAttendanceDto;
    return this.attendanceService.mark({ ...attendance, markedBy: currentUser.id });
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
  @UseGuards(RolesGuard)
  @Roles('admin', 'teacher')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification; used as markedBy when x-user-role is present.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin and teacher may update attendance.' })
  @ApiOperation({ summary: 'Update an attendance record status or manual marker' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce3' })
  @ApiResponse({ status: 200, description: 'Attendance record updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid attendance update payload' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() currentUser: GatewayUser,
  ) {
    if (!currentUser.role) return this.attendanceService.update(id, updateAttendanceDto);

    const { markedBy: _manualMarkedBy, ...attendance } = updateAttendanceDto;
    return this.attendanceService.update(id, { ...attendance, markedBy: currentUser.id });
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
