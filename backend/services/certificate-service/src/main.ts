import { NestFactory } from '@nestjs/core'; import { CertificateModule } from './certificate.module';
async function bootstrap() { const app = await NestFactory.create(CertificateModule); app.enableCors(); await app.listen(process.env.PORT || 3013); } bootstrap();
