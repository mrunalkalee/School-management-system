import { NestFactory } from '@nestjs/core'; import { ClassTimetableModule } from './class-timetable.module';
async function bootstrap() { const app = await NestFactory.create(ClassTimetableModule); app.enableCors(); await app.listen(process.env.PORT || 3005); } bootstrap();
