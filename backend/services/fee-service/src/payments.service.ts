import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { FeeStructure, FeeStructureDocument } from './fee-structure.schema';
import { Payment, PaymentDocument, PaymentStatus } from './payment.schema';
import { RecordPaymentDto } from './dto/record-payment.dto';

interface StudentRemote { _id: string; classId?: string; }

export interface FeeBalance {
  feeStructure: FeeStructureDocument;
  totalPaid: number;
  balance: number;
  status: PaymentStatus;
}

export interface StudentFeesResponse {
  studentId: string;
  classId: string | null;
  fees: FeeBalance[];
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(FeeStructure.name) private readonly feeStructureModel: Model<FeeStructure>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async record(recordPaymentDto: RecordPaymentDto): Promise<PaymentDocument> {
    const feeStructure = await this.findFeeStructure(recordPaymentDto.feeStructureId);
    await this.remote(this.studentServiceUrl(), recordPaymentDto.studentId, 'Student');
    const totalPaid = await this.totalPaid(recordPaymentDto.studentId, feeStructure.id);
    if (totalPaid + recordPaymentDto.amountPaid > feeStructure.amount) {
      throw new BadRequestException(`Payment exceeds the remaining balance of ${currency(feeStructure.amount - totalPaid)}`);
    }
    return new this.paymentModel({
      ...recordPaymentDto,
      status: paymentStatus(totalPaid + recordPaymentDto.amountPaid, feeStructure.amount),
    }).save();
  }

  async findStudentFees(studentId: string): Promise<StudentFeesResponse> {
    const student = await this.remote<StudentRemote>(this.studentServiceUrl(), studentId, 'Student');
    if (!student.classId) return { studentId, classId: null, fees: [] };
    const feeStructures = await this.feeStructureModel.find({ classId: student.classId }).sort({ dueDate: 1, feeType: 1 }).exec();
    const totals = await this.paymentModel.aggregate<{ _id: string; totalPaid: number }>([
      { $match: { studentId, feeStructureId: { $in: feeStructures.map((structure) => structure.id) } } },
      { $group: { _id: '$feeStructureId', totalPaid: { $sum: '$amountPaid' } } },
    ]).exec();
    const paidByStructure = new Map(totals.map((total) => [total._id, total.totalPaid]));
    return {
      studentId,
      classId: student.classId,
      fees: feeStructures.map((feeStructure) => {
        const totalPaid = Number((paidByStructure.get(feeStructure.id) ?? 0).toFixed(2));
        return {
          feeStructure,
          totalPaid,
          balance: Number(Math.max(0, feeStructure.amount - totalPaid).toFixed(2)),
          status: paymentStatus(totalPaid, feeStructure.amount),
        };
      }),
    };
  }

  private async findFeeStructure(id: string): Promise<FeeStructureDocument> {
    const feeStructure = await this.feeStructureModel.findById(id).exec();
    if (!feeStructure) throw new NotFoundException(`Fee structure ${id} was not found`);
    return feeStructure;
  }

  private async totalPaid(studentId: string, feeStructureId: string): Promise<number> {
    const totals = await this.paymentModel.aggregate<{ totalPaid: number }>([
      { $match: { studentId, feeStructureId } },
      { $group: { _id: null, totalPaid: { $sum: '$amountPaid' } } },
    ]).exec();
    return totals[0]?.totalPaid ?? 0;
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

export function paymentStatus(totalPaid: number, amount: number): PaymentStatus {
  if (totalPaid >= amount) return PaymentStatus.Paid;
  if (totalPaid > 0) return PaymentStatus.Partial;
  return PaymentStatus.Pending;
}

function currency(amount: number): string { return amount.toFixed(2); }
