import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // TODO (future): generate an actual PDF via pdf-lib/Puppeteer and store in cloud storage.
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may issue certificates.' })
  @ApiOperation({ summary: 'Issue a certificate after validating the student' })
  @ApiResponse({ status: 201, description: 'Certificate issued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid certificate payload' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  create(@Body() createCertificateDto: CreateCertificateDto) { return this.certificatesService.create(createCertificateDto); }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may list all certificates.' })
  @ApiOperation({ summary: 'List all certificates' })
  @ApiResponse({ status: 200, description: 'Certificates returned successfully' })
  findAll() { return this.certificatesService.findAll(); }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'List all certificates issued to a student' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Student certificates returned successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  findByStudent(@Param('studentId') studentId: string) { return this.certificatesService.findByStudent(studentId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get one certificate' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Certificate returned successfully' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  findOne(@Param('id') id: string) { return this.certificatesService.findOne(id); }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may update certificates.' })
  @ApiOperation({ summary: 'Update a certificate' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Certificate updated successfully' })
  @ApiResponse({ status: 404, description: 'Certificate or student not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCertificateDto) { return this.certificatesService.update(id, dto); }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may delete certificates.' })
  @ApiOperation({ summary: 'Permanently delete a certificate' })
  @ApiParam({ name: 'id', example: '66b5d38acd65f26429ab4ce5' })
  @ApiResponse({ status: 200, description: 'Certificate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  remove(@Param('id') id: string) { return this.certificatesService.remove(id); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('certificate')
  @ApiOperation({ summary: 'Check certificate-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'certificate-service' }; }
}
