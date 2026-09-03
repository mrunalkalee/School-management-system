import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // TODO (future): generate an actual PDF via pdf-lib/Puppeteer and store in cloud storage.
  @Post()
  @ApiOperation({ summary: 'Issue a certificate after validating the student' })
  @ApiResponse({ status: 201, description: 'Certificate issued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid certificate payload' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  create(@Body() createCertificateDto: CreateCertificateDto) { return this.certificatesService.create(createCertificateDto); }

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
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('certificate')
  @ApiOperation({ summary: 'Check certificate-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'certificate-service' }; }
}
