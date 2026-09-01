import { NestFactory } from '@nestjs/core'; import { LibraryItemModule } from './library.module';
async function bootstrap() { const app = await NestFactory.create(LibraryItemModule); app.enableCors(); await app.listen(process.env.PORT || 3011); } bootstrap();
