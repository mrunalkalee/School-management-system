import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { FeeStructure, FeeStructureDocument } from './fee-structure.schema';

@Injectable()
export class FeeStructuresService {
  constructor(
    @InjectModel(FeeStructure.name) private readonly feeStructureModel: Model<FeeStructure>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createFeeStructureDto: CreateFeeStructureDto): Promise<FeeStructureDocument> {
    await this.remote(this.classServiceUrl(), createFeeStructureDto.classId, 'Class');
    try {
      return await new this.feeStructureModel(createFeeStructureDto).save();
    } catch (error: unknown) {
      if (this.isDuplicateKey(error)) throw new ConflictException('A fee structure already exists for this class, academic year, and fee type');
      throw error;
    }
  }

  async findAll(classId?: string): Promise<FeeStructureDocument[]> {
    const filter: FilterQuery<FeeStructure> = classId ? { classId } : {};
    return this.feeStructureModel.find(filter).sort({ dueDate: 1, feeType: 1 }).exec();
  }

  async findOne(id: string): Promise<FeeStructureDocument> {
    const feeStructure = await this.feeStructureModel.findById(id).exec();
    if (!feeStructure) throw new NotFoundException(`Fee structure ${id} was not found`);
    return feeStructure;
  }

  private async remote<T>(baseUrl: string, id: string, name: string): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get<T>(`${baseUrl}/${id}`));
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) throw new NotFoundException(`${name} ${id} was not found`);
      if (axios.isAxiosError(error) && !error.response) throw new ServiceUnavailableException(`Unable to reach ${name} service`);
      throw error;
    }
  }

  private classServiceUrl(): string { return this.configService.getOrThrow<string>('CLASS_SERVICE_URL'); }
  private isDuplicateKey(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
