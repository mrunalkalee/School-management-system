import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController, LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { LeaveRequest, LeaveRequestSchema } from './leave-request.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }),
    }),
    MongooseModule.forFeature([{ name: LeaveRequest.name, schema: LeaveRequestSchema }]),
  ],
  controllers: [LeaveController, HealthController],
  providers: [LeaveService],
})
export class LeaveModule {}
