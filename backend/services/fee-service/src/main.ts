import { NestFactory } from '@nestjs/core'; import { FeeModule } from './fee.module';
async function bootstrap() { const app = await NestFactory.create(FeeModule); app.enableCors(); await app.listen(process.env.PORT || 3009); } bootstrap();
