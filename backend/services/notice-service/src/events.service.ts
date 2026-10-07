import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './event.schema';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<Event>) {}
  async create(createEventDto: CreateEventDto): Promise<EventDocument> { return new this.eventModel(createEventDto).save(); }
  async findAll(): Promise<EventDocument[]> { return this.eventModel.find().sort({ date: 1, title: 1 }).exec(); }
  async update(id: string, dto: UpdateEventDto): Promise<EventDocument> { const event = await this.eventModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec(); if (!event) throw new NotFoundException(`Event ${id} was not found`); return event; }
  async remove(id: string): Promise<{ message: string }> { const event = await this.eventModel.findByIdAndDelete(id).exec(); if (!event) throw new NotFoundException(`Event ${id} was not found`); return { message: 'Event deleted successfully' }; }
}
