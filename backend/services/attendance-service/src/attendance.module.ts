import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController, HealthController } from './attendance.controller';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from './roles.guard';

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
  providers: [AttendanceService, RolesGuard],
})
export class AttendanceModule {}
