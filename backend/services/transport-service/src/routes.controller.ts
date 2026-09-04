import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRouteDto } from './dto/create-route.dto';
import { RoutesService } from './routes.service';

@ApiTags('Transport - Routes')
@Controller('transport/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bus route with its vehicle, driver, and pickup stops' })
  @ApiResponse({ status: 201, description: 'Route created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid route payload' })
  @ApiResponse({ status: 409, description: 'Vehicle number already exists' })
  create(@Body() dto: CreateRouteDto) { return this.routesService.create(dto); }

  @Get()
  @ApiOperation({ summary: 'List all bus routes' })
  @ApiResponse({ status: 200, description: 'Routes returned successfully' })
  findAll() { return this.routesService.findAll(); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('transport')
  @ApiOperation({ summary: 'Check transport-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'transport-service' }; }
}
