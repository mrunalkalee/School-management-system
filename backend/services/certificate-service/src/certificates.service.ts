import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Certificate, CertificateDocument, CertificateRecipientType, CertificateRequestStatus } from './certificate.schema';
import { CreateCertificateRequestDto } from './dto/create-certificate-request.dto';
import { ReviewCertificateRequestDto } from './dto/review-certificate-request.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name) private readonly certificateModel: Model<Certificate>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // TODO (future): generate an actual PDF via pdf-lib/Puppeteer and store in cloud storage.
  async create(createCertificateDto: CreateCertificateDto): Promise<CertificateDocument> {
    await this.remote(this.studentServiceUrl(), createCertificateDto.studentId, 'Student');
    return new this.certificateModel({ ...createCertificateDto, recipientId: createCertificateDto.studentId, recipientType: CertificateRecipientType.Student, status: CertificateRequestStatus.Approved, issuedDate: new Date() }).save();
  }

  async request(dto: CreateCertificateRequestDto, recipientId: string, recipientType: CertificateRecipientType): Promise<CertificateDocument> {
    if (!recipientId) throw new BadRequestException('A linked profile is required to request a certificate');
    await this.remote(recipientType === CertificateRecipientType.Student ? this.studentServiceUrl() : this.teacherServiceUrl(), recipientId, recipientType === CertificateRecipientType.Student ? 'Student' : 'Teacher');
    return new this.certificateModel({ recipientId, recipientType, studentId: recipientType === CertificateRecipientType.Student ? recipientId : undefined, type: dto.type, status: CertificateRequestStatus.Pending }).save();
  }

  async requests(recipientId?: string): Promise<CertificateDocument[]> {
    return this.certificateModel.find(recipientId ? { recipientId } : {}).sort({ createdAt: -1 }).exec();
  }

  async review(id: string, dto: ReviewCertificateRequestDto, reviewerId?: string): Promise<CertificateDocument> {
    if (![CertificateRequestStatus.Approved, CertificateRequestStatus.Rejected].includes(dto.status)) throw new BadRequestException('Requests may only be approved or rejected');
    const request = await this.findOne(id);
    if (request.status !== CertificateRequestStatus.Pending) throw new BadRequestException('This certificate request has already been reviewed');
    request.status = dto.status;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.rejectionReason = dto.status === CertificateRequestStatus.Rejected ? dto.rejectionReason : undefined;
    if (dto.status === CertificateRequestStatus.Approved) { request.issuedDate = new Date(); request.issuedBy = reviewerId; }
    return request.save();
  }

  async findByStudent(studentId: string): Promise<CertificateDocument[]> {
    await this.remote(this.studentServiceUrl(), studentId, 'Student');
    return this.certificateModel.find({ studentId }).sort({ issuedDate: -1 }).exec();
  }

  async findAll(): Promise<CertificateDocument[]> {
    return this.certificateModel.find().sort({ issuedDate: -1 }).exec();
  }

  async findOne(id: string): Promise<CertificateDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException(`Certificate ${id} was not found`);
    const certificate = await this.certificateModel.findById(id).exec();
    if (!certificate) throw new NotFoundException(`Certificate ${id} was not found`);
    return certificate;
  }

  async update(id: string, dto: UpdateCertificateDto): Promise<CertificateDocument> {
    await this.findOne(id);
    if (dto.studentId) await this.remote(this.studentServiceUrl(), dto.studentId, 'Student');
    const certificate = await this.certificateModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec();
    if (!certificate) throw new NotFoundException(`Certificate ${id} was not found`);
    return certificate;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.certificateModel.findByIdAndDelete(id).exec();
    return { message: 'Certificate deleted successfully' };
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

  private studentServiceUrl(): string { return this.configService.getOrThrow<string>('STUDENT_SERVICE_URL'); }
  private teacherServiceUrl(): string { return this.configService.getOrThrow<string>('TEACHER_SERVICE_URL'); }
}
