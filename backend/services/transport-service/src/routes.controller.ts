import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { RoutesService } from './routes.service';

@ApiTags('Transport - Routes')
@Controller('transport/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. If present, only admin may create routes.' })
  @ApiOperation({ summary: 'Create a bus route with its vehicle, driver, and pickup stops' })
  @ApiResponse({ status: 201, description: 'Route created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid route payload' })
  @ApiResponse({ status: 409, description: 'Vehicle number already exists' })
  create(@Body() dto: CreateRouteDto, @CurrentUser() _currentUser: CurrentUser) {
    return this.routesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all bus routes' })
  @ApiResponse({ status: 200, description: 'Routes returned successfully' })
  findAll() { return this.routesService.findAll(); }

  @Patch(':id') @UseGuards(RolesGuard) @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'] })
  @ApiOperation({ summary: 'Update a bus route' }) @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Route updated successfully' }) @ApiResponse({ status: 404, description: 'Route not found' }) @ApiResponse({ status: 409, description: 'Vehicle number already exists' })
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) { return this.routesService.update(id, dto); }

  @Delete(':id') @UseGuards(RolesGuard) @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'] })
  @ApiOperation({ summary: 'Delete a route when it has no student allocations' }) @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Route deleted successfully' }) @ApiResponse({ status: 400, description: 'Route has active student allocations' }) @ApiResponse({ status: 404, description: 'Route not found' })
  remove(@Param('id') id: string) { return this.routesService.remove(id); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('transport')
  @ApiOperation({ summary: 'Check transport-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'transport-service' }; }
}
