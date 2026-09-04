import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRouteDto } from './dto/create-route.dto';
import { Route, RouteDocument } from './route.schema';

@Injectable()
export class RoutesService {
  constructor(@InjectModel(Route.name) private readonly routeModel: Model<Route>) {}

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
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
}
