import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

// TODO: restrict event posting to Admin users once auth-service exists.
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a school event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event payload' })
  create(@Body() createEventDto: CreateEventDto) { return this.eventsService.create(createEventDto); }
  @Get()
  @ApiOperation({ summary: 'List events in ascending date order' })
  @ApiResponse({ status: 200, description: 'Events returned successfully' })
  findAll() { return this.eventsService.findAll(); }
}
