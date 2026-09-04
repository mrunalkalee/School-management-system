import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { NoticesService } from './notices.service';
import { TargetRole } from './notice.schema';

// TODO: restrict notice posting to Admin users once auth-service exists.
@ApiTags('Notices')
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}
  @Post()
  @ApiOperation({ summary: 'Post a notice, validating its target class only when one is supplied' })
  @ApiResponse({ status: 201, description: 'Notice created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid notice payload' })
  @ApiResponse({ status: 404, description: 'Target class not found' })
  @ApiResponse({ status: 503, description: 'Class service unavailable' })
  create(@Body() createNoticeDto: CreateNoticeDto) { return this.noticesService.create(createNoticeDto); }

  @Get()
  @ApiOperation({ summary: 'List active notices matching an audience role and optional class, including all-audience notices' })
  @ApiQuery({ name: 'targetRole', required: false, enum: TargetRole })
  @ApiQuery({ name: 'classId', required: false, example: '66b5d38acd65f26429ab4ce2' })
  @ApiResponse({ status: 200, description: 'Matching non-expired notices returned successfully' })
  findAll(@Query('targetRole') targetRole?: TargetRole, @Query('classId') classId?: string) { return this.noticesService.findAll(targetRole, classId); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('notice')
  @ApiOperation({ summary: 'Check notice-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'notice-service' }; }
}
