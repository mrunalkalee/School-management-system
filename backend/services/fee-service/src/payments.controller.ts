import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaymentsService } from './payments.service';

// TODO: verify JWT via API Gateway headers once auth-service exists.
@ApiTags('Payments')
@Controller('fees')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments')
  @ApiOperation({ summary: 'Record a payment and compute paid or partial status from the fee balance' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment payload or payment exceeds the balance' })
  @ApiResponse({ status: 404, description: 'Student or fee structure not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  record(@Body() recordPaymentDto: RecordPaymentDto) { return this.paymentsService.record(recordPaymentDto); }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get stable per-fee balance and status data for a student dashboard' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce1' })
  @ApiResponse({ status: 200, description: 'Student fee balances and statuses returned successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 503, description: 'Student service unavailable' })
  findStudentFees(@Param('studentId') studentId: string) { return this.paymentsService.findStudentFees(studentId); }
}
