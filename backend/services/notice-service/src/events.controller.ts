import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO: restrict event posting to Admin users once auth-service exists.
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may create events.' })
  @ApiOperation({ summary: 'Create a school event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event payload' })
  create(@Body() createEventDto: CreateEventDto) { return this.eventsService.create(createEventDto); }
  @Get()
  @ApiOperation({ summary: 'List events in ascending date order' })
  @ApiResponse({ status: 200, description: 'Events returned successfully' })
  findAll() { return this.eventsService.findAll(); }
}
