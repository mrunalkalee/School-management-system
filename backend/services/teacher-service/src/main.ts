import { NestFactory } from '@nestjs/core'; import { TeacherModule } from './teacher.module';
async function bootstrap() { const app = await NestFactory.create(TeacherModule); app.enableCors(); await app.listen(process.env.PORT || 3003); } bootstrap();
