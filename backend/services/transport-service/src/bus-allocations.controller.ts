import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllocateStudentDto } from './dto/allocate-student.dto';
import { BusAllocationsService } from './bus-allocations.service';

@ApiTags('Transport - Allocations')
@Controller('transport')
export class BusAllocationsController {
  constructor(private readonly busAllocationsService: BusAllocationsService) {}

  @Post('allocate')
  @ApiOperation({ summary: 'Create or replace a student’s active bus allocation' })
  @ApiResponse({ status: 200, description: 'Existing allocation updated successfully' })
  @ApiResponse({ status: 201, description: 'Student allocated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload or selected stop is not on the route' })
  @ApiResponse({ status: 404, description: 'Student or route not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  allocate(@Body() dto: AllocateStudentDto) { return this.busAllocationsService.allocate(dto); }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get the current transport allocation for a student' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Student allocation returned successfully' })
  @ApiResponse({ status: 404, description: 'No allocation exists for the student' })
  findStudentAllocation(@Param('studentId') studentId: string) { return this.busAllocationsService.findStudentAllocation(studentId); }
}
