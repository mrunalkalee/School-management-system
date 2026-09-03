import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController, TimetableController } from './timetable.controller';
import { Timetable, TimetableSchema } from './timetable.schema';
import { TimetableService } from './timetable.service';

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
    MongooseModule.forFeature([{ name: Timetable.name, schema: TimetableSchema }]),
  ],
  controllers: [TimetableController, HealthController],
  providers: [TimetableService],
})
export class TimetableModule {}
