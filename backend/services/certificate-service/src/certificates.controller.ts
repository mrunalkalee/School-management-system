import { Body, Controller, Delete, Get, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { CurrentUser, type CurrentUser as CurrentUserData } from './current-user.decorator';
import { CertificateRecipientType } from './certificate.schema';
import { CreateCertificateRequestDto } from './dto/create-certificate-request.dto';
import { ReviewCertificateRequestDto } from './dto/review-certificate-request.dto';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('requests')
  @UseGuards(RolesGuard)
  @Roles('student', 'teacher')
  @ApiOperation({ summary: 'Request a certificate for the authenticated student or teacher profile' })
  request(@Body() dto: CreateCertificateRequestDto, @CurrentUser() user: CurrentUserData) {
    if (!user.role || !user.linkedProfileId) throw new UnauthorizedException('A linked profile is required to request a certificate');
    return this.certificatesService.request(dto, user.linkedProfileId, user.role === 'student' ? CertificateRecipientType.Student : CertificateRecipientType.Teacher);
  }

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles('admin', 'student', 'teacher')
  @ApiOperation({ summary: 'List all requests for admins, or the authenticated requester’s own requests' })
  requests(@CurrentUser() user: CurrentUserData) {
    if (user.role === 'admin') return this.certificatesService.requests();
    if (!user.linkedProfileId) throw new UnauthorizedException('A linked profile is required to view certificate requests');
    return this.certificatesService.requests(user.linkedProfileId);
  }

  @Patch('requests/:id/review')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Approve or reject a pending certificate request' })
  review(@Param('id') id: string, @Body() dto: ReviewCertificateRequestDto, @CurrentUser() user: CurrentUserData) { return this.certificatesService.review(id, dto, user.id); }
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
