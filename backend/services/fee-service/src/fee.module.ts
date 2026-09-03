import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeStructure, FeeStructureSchema } from './fee-structure.schema';
import { FeeStructuresController, HealthController } from './fee-structures.controller';
import { FeeStructuresService } from './fee-structures.service';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }),
    }),
    MongooseModule.forFeature([
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [FeeStructuresController, PaymentsController, HealthController],
  providers: [FeeStructuresService, PaymentsService],
})
export class FeeModule {}
