import { NestFactory } from '@nestjs/core'; import { AdmissionModule } from './admission.module';
async function bootstrap() { const app = await NestFactory.create(AdmissionModule); app.enableCors(); await app.listen(process.env.PORT || 3004); } bootstrap();
