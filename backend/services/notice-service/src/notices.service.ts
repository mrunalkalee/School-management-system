import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { FilterQuery, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { Notice, NoticeDocument, TargetRole } from './notice.schema';

@Injectable()
export class NoticesService {
  constructor(
    @InjectModel(Notice.name) private readonly noticeModel: Model<Notice>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createNoticeDto: CreateNoticeDto): Promise<NoticeDocument> {
    if (createNoticeDto.targetClassId) await this.remote(this.classServiceUrl(), createNoticeDto.targetClassId, 'Class');
    return new this.noticeModel(createNoticeDto).save();
  }

  async findAll(targetRole?: TargetRole, classId?: string): Promise<NoticeDocument[]> {
    const filters: FilterQuery<Notice>[] = [
      { $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gt: new Date() } }] },
    ];
    if (targetRole) filters.push({ targetRole: { $in: [targetRole, TargetRole.All] } });
    if (classId) filters.push({ $or: [{ targetClassId: classId }, { targetClassId: { $exists: false } }, { targetClassId: null }] });
    else filters.push({ $or: [{ targetClassId: { $exists: false } }, { targetClassId: null }] });
    return this.noticeModel.find({ $and: filters }).sort({ postedAt: -1 }).exec();
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
}
