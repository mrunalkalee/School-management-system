import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { isValidObjectId, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Certificate, CertificateDocument } from './certificate.schema';
import { CreateCertificateDto } from './dto/create-certificate.dto';

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
    return new this.certificateModel(createCertificateDto).save();
  }

  async findByStudent(studentId: string): Promise<CertificateDocument[]> {
    await this.remote(this.studentServiceUrl(), studentId, 'Student');
    return this.certificateModel.find({ studentId }).sort({ issuedDate: -1 }).exec();
  }

  async findOne(id: string): Promise<CertificateDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException(`Certificate ${id} was not found`);
    const certificate = await this.certificateModel.findById(id).exec();
    if (!certificate) throw new NotFoundException(`Certificate ${id} was not found`);
    return certificate;
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
}
