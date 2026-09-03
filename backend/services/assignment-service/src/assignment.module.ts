import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Assignment, AssignmentSchema } from './assignment.schema';
import { AssignmentsController, HealthController, SubmissionsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Submission, SubmissionSchema } from './submission.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }),
    }),
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
  ],
  controllers: [AssignmentsController, SubmissionsController, HealthController],
  providers: [AssignmentsService],
})
export class AssignmentModule {}
