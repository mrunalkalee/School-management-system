import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Admission, AdmissionSchema } from './admission.schema';
import { AdmissionsController, HealthController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), HttpModule,
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }) }),
    MongooseModule.forFeature([{ name: Admission.name, schema: AdmissionSchema }]),
  ],
  controllers: [AdmissionsController, HealthController],
  providers: [AdmissionsService],
})
export class AdmissionModule {}
