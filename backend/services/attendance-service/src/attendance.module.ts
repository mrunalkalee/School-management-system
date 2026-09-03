import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController, HealthController } from './attendance.controller';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]),
  ],
  controllers: [AttendanceController, HealthController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
