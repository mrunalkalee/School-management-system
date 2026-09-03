import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificate, CertificateSchema } from './certificate.schema';
import { CertificatesController, HealthController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), HttpModule,
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }) }),
    MongooseModule.forFeature([{ name: Certificate.name, schema: CertificateSchema }]),
  ],
  controllers: [CertificatesController, HealthController],
  providers: [CertificatesService],
})
export class CertificateModule {}
