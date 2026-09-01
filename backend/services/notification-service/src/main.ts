import { NestFactory } from '@nestjs/core'; import { NotificationModule } from './notification.module';
async function bootstrap() { const app = await NestFactory.create(NotificationModule); app.enableCors(); await app.listen(process.env.PORT || 3015); } bootstrap();
