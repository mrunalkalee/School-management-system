import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticesService } from './notices.service';
import { TargetRole } from './notice.schema';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO: restrict notice posting to Admin users once auth-service exists.
@ApiTags('Notices')
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may post notices.' })
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

  @Patch(':id') @UseGuards(RolesGuard) @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'] })
  @ApiOperation({ summary: 'Update a notice' }) @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Notice updated successfully' }) @ApiResponse({ status: 404, description: 'Notice or target class not found' })
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) { return this.noticesService.update(id, dto); }

  @Delete(':id') @UseGuards(RolesGuard) @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'] })
  @ApiOperation({ summary: 'Permanently delete a notice' }) @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Notice deleted successfully' }) @ApiResponse({ status: 404, description: 'Notice not found' })
  remove(@Param('id') id: string) { return this.noticesService.remove(id); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('notice')
  @ApiOperation({ summary: 'Check notice-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'notice-service' }; }
}
