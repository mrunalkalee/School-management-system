import { NestFactory } from '@nestjs/core'; import { AttendanceModule } from './attendance.module';
async function bootstrap() { const app = await NestFactory.create(AttendanceModule); app.enableCors(); await app.listen(process.env.PORT || 3006); } bootstrap();
