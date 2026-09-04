import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { AllocateStudentDto } from './dto/allocate-student.dto';
import { BusAllocation, BusAllocationDocument } from './bus-allocation.schema';
import { Route } from './route.schema';

@Injectable()
export class BusAllocationsService {
  constructor(
    @InjectModel(BusAllocation.name) private readonly allocationModel: Model<BusAllocation>,
    @InjectModel(Route.name) private readonly routeModel: Model<Route>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async allocate(dto: AllocateStudentDto): Promise<BusAllocationDocument> {
    await this.remote<unknown>(this.studentServiceUrl(), dto.studentId);
    const route = await this.routeModel.findById(dto.routeId).exec();
    if (!route) throw new NotFoundException(`Route ${dto.routeId} was not found`);
    if (!route.stops.some((stop) => stop.stopName.toLocaleLowerCase() === dto.stopName.trim().toLocaleLowerCase())) {
      throw new BadRequestException('The selected stop is not on this route');
    }
    return this.allocationModel.findOneAndUpdate(
      { studentId: dto.studentId },
      { $set: { routeId: dto.routeId, stopName: dto.stopName.trim() }, $setOnInsert: { studentId: dto.studentId } },
      { new: true, upsert: true, runValidators: true },
    ).exec();
  }

  async findStudentAllocation(studentId: string): Promise<BusAllocationDocument> {
    const allocation = await this.allocationModel.findOne({ studentId }).exec();
    if (!allocation) throw new NotFoundException(`No transport allocation exists for student ${studentId}`);
    return allocation;
  }

  private async remote<T>(baseUrl: string, id: string): Promise<T> {
    try {
      return (await firstValueFrom(this.httpService.get<T>(`${baseUrl}/${encodeURIComponent(id)}`))).data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) throw new NotFoundException(`Student ${id} was not found`);
      if (axios.isAxiosError(error) && !error.response) throw new ServiceUnavailableException('Unable to reach student service');
      throw error;
    }
  }

  private studentServiceUrl(): string { return this.configService.getOrThrow<string>('STUDENT_SERVICE_URL'); }
}
