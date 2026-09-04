import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}
  async create(createEventDto: CreateEventDto): Promise<EventDocument> { return new this.eventModel(createEventDto).save(); }
  async findAll(): Promise<EventDocument[]> { return this.eventModel.find().sort({ date: 1, title: 1 }).exec(); }
}
