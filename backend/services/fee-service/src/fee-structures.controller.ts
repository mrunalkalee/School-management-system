import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { FeeStructuresService } from './fee-structures.service';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Fee Structures')
@Controller('fees/structures')
export class FeeStructuresController {
  constructor(private readonly feeStructuresService: FeeStructuresService) {}

  @Post()
  @ApiOperation({ summary: 'Create a fee structure after validating its class' })
  @ApiResponse({ status: 201, description: 'Fee structure created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid fee structure payload' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Fee structure already exists for this class, academic year, and fee type' })
  @ApiResponse({ status: 503, description: 'Class service unavailable' })
  create(@Body() createFeeStructureDto: CreateFeeStructureDto) { return this.feeStructuresService.create(createFeeStructureDto); }

  @Get()
  @ApiOperation({ summary: 'List fee structures, optionally filtered by class' })
  @ApiQuery({ name: 'classId', required: false, example: '66b5d38acd65f26429ab4ce2' })
  @ApiResponse({ status: 200, description: 'Fee structures returned successfully' })
  findAll(@Query('classId') classId?: string) { return this.feeStructuresService.findAll(classId); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('fee')
  @ApiOperation({ summary: 'Check fee-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'fee-service' }; }
}
