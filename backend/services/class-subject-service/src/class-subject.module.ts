import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesController, HealthController } from './classes.controller';
import { ClassesService } from './classes.service';
import { SchoolClass, SchoolClassSchema } from './class.schema';
import { Subject, SubjectSchema } from './subject.schema';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

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
    MongooseModule.forFeature([
      { name: SchoolClass.name, schema: SchoolClassSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],
  controllers: [ClassesController, SubjectsController, HealthController],
  providers: [ClassesService, SubjectsService],
})
export class ClassSubjectModule {}
