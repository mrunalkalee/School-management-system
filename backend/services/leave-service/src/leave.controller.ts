import { Body, Controller, Get, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, GatewayUser } from './current-user.decorator';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';
import { LeaveService } from './leave.service';
import { LeaveStatus, RequesterType } from './leave-request.schema';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Leave')
@Controller('leave-requests')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('student', 'teacher')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification; used as requesterId when x-user-role is present.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only student and teacher may create leave requests; it also determines requesterType.' })
  @ApiOperation({ summary: 'Create a leave request after validating the student or teacher requester' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid leave payload or invalid date range' })
  @ApiResponse({ status: 404, description: 'Student or teacher not found' })
  @ApiResponse({ status: 503, description: 'Student or teacher service unavailable' })
  create(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @CurrentUser() currentUser: GatewayUser,
  ) {
    if (!currentUser.role) return this.leaveService.create(createLeaveRequestDto);
    if (!currentUser.id) throw new UnauthorizedException('x-user-id is required when x-user-role is present');

    const { requesterId: _bodyRequesterId, requesterType: _bodyRequesterType, ...leaveRequest } =
      createLeaveRequestDto;
    const requesterType = currentUser.role === 'student'
      ? RequesterType.Student
      : RequesterType.Teacher;

    return this.leaveService.createForAuthUser(currentUser.id, requesterType, leaveRequest);
  }

  @Get()
  @ApiOperation({ summary: 'List leave requests, optionally filtered by requester and status' })
  @ApiQuery({ name: 'requesterId', required: false, example: '66b5d38acd65f26429ab4ce1' })
  @ApiQuery({ name: 'status', required: false, enum: LeaveStatus })
  @ApiResponse({ status: 200, description: 'Leave requests returned successfully' })
  findAll(@Query('requesterId') requesterId?: string, @Query('status') status?: LeaveStatus) {
    return this.leaveService.findAll(requesterId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one leave request' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Leave request returned successfully' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  findOne(@Param('id') id: string) { return this.leaveService.findOne(id); }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may review leave requests.' })
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Leave request reviewed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid review payload' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  review(@Param('id') id: string, @Body() reviewLeaveRequestDto: ReviewLeaveRequestDto) {
    return this.leaveService.review(id, reviewLeaveRequestDto);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('leave')
  @ApiOperation({ summary: 'Check leave-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'leave-service' }; }
}
