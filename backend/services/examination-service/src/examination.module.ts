import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from './exam.schema';
import { ExamsController, HealthController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Marks, MarksSchema } from './marks.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }),
    }),
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Marks.name, schema: MarksSchema },
    ]),
  ],
  controllers: [ExamsController, HealthController],
  providers: [ExamsService],
})
export class ExaminationModule {}
