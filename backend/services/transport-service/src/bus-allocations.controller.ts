import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllocateStudentDto } from './dto/allocate-student.dto';
import { BusAllocationsService } from './bus-allocations.service';
import { CurrentUser } from './current-user.decorator';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('Transport - Allocations')
@Controller('transport')
export class BusAllocationsController {
  constructor(private readonly busAllocationsService: BusAllocationsService) {}

  @Post('allocate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. If present, only admin may allocate students.' })
  @ApiOperation({ summary: 'Create or replace a student’s active bus allocation' })
  @ApiResponse({ status: 200, description: 'Existing allocation updated successfully' })
  @ApiResponse({ status: 201, description: 'Student allocated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload or selected stop is not on the route' })
  @ApiResponse({ status: 404, description: 'Student or route not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  allocate(@Body() dto: AllocateStudentDto, @CurrentUser() _currentUser: CurrentUser) {
    return this.busAllocationsService.allocate(dto);
  }

  @Get('allocations')
  @ApiOperation({ summary: 'List all current student bus allocations' })
  @ApiResponse({ status: 200, description: 'Bus allocations returned successfully' })
  findAll() {
    return this.busAllocationsService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get the current transport allocation for a student' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Student allocation returned successfully' })
  @ApiResponse({ status: 404, description: 'No allocation exists for the student' })
  findStudentAllocation(@Param('studentId') studentId: string) {
    return this.busAllocationsService.findStudentAllocation(studentId);
  }
}
