import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { BusAllocation } from './bus-allocation.schema';
import { Route, RouteDocument } from './route.schema';

@Injectable()
export class RoutesService {
  constructor(@InjectModel(Route.name) private readonly routeModel: Model<Route>, @InjectModel(BusAllocation.name) private readonly allocationModel: Model<BusAllocation>) {}

  async create(dto: CreateRouteDto): Promise<RouteDocument> {
    try {
      return await new this.routeModel(dto).save();
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) throw new ConflictException('A route with this vehicle number already exists');
      throw error;
    }
  }

  async findAll(): Promise<RouteDocument[]> {
    return this.routeModel.find().sort({ routeName: 1 }).exec();
  }
  async update(id: string, dto: UpdateRouteDto): Promise<RouteDocument> { await this.findOne(id); try { const route = await this.routeModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec(); if (!route) throw new NotFoundException(`Route ${id} was not found`); return route; } catch (error: unknown) { if (isDuplicateKeyError(error)) throw new ConflictException('A route with this vehicle number already exists'); throw error; } }
  async remove(id: string): Promise<{ message: string }> { await this.findOne(id); if (await this.allocationModel.exists({ routeId: id })) throw new BadRequestException('This route cannot be deleted because students are currently allocated to it'); await this.routeModel.findByIdAndDelete(id).exec(); return { message: 'Route deleted successfully' }; }
  private async findOne(id: string): Promise<RouteDocument> { if (!isValidObjectId(id)) throw new NotFoundException(`Route ${id} was not found`); const route = await this.routeModel.findById(id).exec(); if (!route) throw new NotFoundException(`Route ${id} was not found`); return route; }
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
}
