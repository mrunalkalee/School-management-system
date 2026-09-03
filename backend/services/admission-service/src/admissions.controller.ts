import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdmissionStatus } from './admission.schema';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Admissions')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an admission application after validating the applied class' })
  @ApiResponse({ status: 201, description: 'Admission application created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid admission payload' })
  @ApiResponse({ status: 404, description: 'Applied class not found' })
  @ApiResponse({ status: 503, description: 'Class service unavailable' })
  create(@Body() createAdmissionDto: CreateAdmissionDto) { return this.admissionsService.create(createAdmissionDto); }

  @Get()
  @ApiOperation({ summary: 'List admission applications, optionally filtered by status' })
  @ApiQuery({ name: 'status', required: false, enum: AdmissionStatus })
  @ApiResponse({ status: 200, description: 'Admission applications returned successfully' })
  findAll(@Query('status') status?: AdmissionStatus) { return this.admissionsService.findAll(status); }

  @Get(':id')
  @ApiOperation({ summary: 'Get one admission application' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Admission application returned successfully' })
  @ApiResponse({ status: 404, description: 'Admission application not found' })
  findOne(@Param('id') id: string) { return this.admissionsService.findOne(id); }

  // TODO (future phase): call student-service's POST /students to auto-create a Student record on approval — cross-service write not wired yet to keep this phase isolated.
  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve or reject an admission application' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Admission status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status payload' })
  @ApiResponse({ status: 404, description: 'Admission application not found' })
  updateStatus(@Param('id') id: string, @Body() updateAdmissionStatusDto: UpdateAdmissionStatusDto) {
    return this.admissionsService.updateStatus(id, updateAdmissionStatusDto);
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('admission')
  @ApiOperation({ summary: 'Check admission-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'admission-service' }; }
}
