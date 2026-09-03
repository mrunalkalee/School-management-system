import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';
import { LeaveRequest, LeaveRequestDocument, LeaveStatus, RequesterType } from './leave-request.schema';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(LeaveRequest.name) private readonly leaveRequestModel: Model<LeaveRequest>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequestDocument> {
    if (createLeaveRequestDto.toDate < createLeaveRequestDto.fromDate) {
      throw new BadRequestException('toDate must be on or after fromDate');
    }
    const { requesterId, requesterType } = createLeaveRequestDto;
    await this.remote(this.requesterServiceUrl(requesterType), requesterId, requesterType === RequesterType.Student ? 'Student' : 'Teacher');
    return new this.leaveRequestModel(createLeaveRequestDto).save();
  }

  async findAll(requesterId?: string, status?: LeaveStatus): Promise<LeaveRequestDocument[]> {
    const filter: FilterQuery<LeaveRequest> = {};
    if (requesterId) filter.requesterId = requesterId;
    if (status) filter.status = status;
    return this.leaveRequestModel.find(filter).sort({ fromDate: -1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<LeaveRequestDocument> {
    this.assertValidId(id);
    const leaveRequest = await this.leaveRequestModel.findById(id).exec();
    if (!leaveRequest) throw new NotFoundException(`Leave request ${id} was not found`);
    return leaveRequest;
  }

  async review(id: string, reviewLeaveRequestDto: ReviewLeaveRequestDto): Promise<LeaveRequestDocument> {
    await this.findOne(id);
    const leaveRequest = await this.leaveRequestModel.findByIdAndUpdate(
      id,
      { $set: { ...reviewLeaveRequestDto, reviewedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    if (!leaveRequest) throw new NotFoundException(`Leave request ${id} was not found`);
    return leaveRequest;
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

  private requesterServiceUrl(type: RequesterType): string {
    return type === RequesterType.Student
      ? this.configService.getOrThrow<string>('STUDENT_SERVICE_URL')
      : this.configService.getOrThrow<string>('TEACHER_SERVICE_URL');
  }

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) throw new NotFoundException(`Leave request ${id} was not found`);
  }
}
