import { NestFactory } from '@nestjs/core'; import { NoticeModule } from './notice.module';
async function bootstrap() { const app = await NestFactory.create(NoticeModule); app.enableCors(); await app.listen(process.env.PORT || 3014); } bootstrap();
