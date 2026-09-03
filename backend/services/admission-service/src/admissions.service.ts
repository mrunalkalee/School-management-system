import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Admission, AdmissionDocument, AdmissionStatus } from './admission.schema';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionStatusDto } from './dto/update-admission-status.dto';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectModel(Admission.name) private readonly admissionModel: Model<Admission>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAdmissionDto: CreateAdmissionDto): Promise<AdmissionDocument> {
    await this.remote(this.classServiceUrl(), createAdmissionDto.appliedClassId, 'Class');
    return new this.admissionModel(createAdmissionDto).save();
  }

  async findAll(status?: AdmissionStatus): Promise<AdmissionDocument[]> {
    const filter: FilterQuery<Admission> = status ? { status } : {};
    return this.admissionModel.find(filter).sort({ submittedAt: -1 }).exec();
  }

  async findOne(id: string): Promise<AdmissionDocument> {
    this.assertValidId(id);
    const admission = await this.admissionModel.findById(id).exec();
    if (!admission) throw new NotFoundException(`Admission ${id} was not found`);
    return admission;
  }

  // TODO (future phase): call student-service's POST /students to auto-create a Student record on approval — cross-service write not wired yet to keep this phase isolated.
  async updateStatus(id: string, updateAdmissionStatusDto: UpdateAdmissionStatusDto): Promise<AdmissionDocument> {
    await this.findOne(id);
    const admission = await this.admissionModel.findByIdAndUpdate(
      id,
      { $set: { ...updateAdmissionStatusDto, reviewedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    if (!admission) throw new NotFoundException(`Admission ${id} was not found`);
    return admission;
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
  private assertValidId(id: string): void { if (!isValidObjectId(id)) throw new NotFoundException(`Admission ${id} was not found`); }
}
