import { NestFactory } from '@nestjs/core'; import { ExaminationModule } from './examination.module';
async function bootstrap() { const app = await NestFactory.create(ExaminationModule); app.enableCors(); await app.listen(process.env.PORT || 3008); } bootstrap();
