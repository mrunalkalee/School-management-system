import { NestFactory } from '@nestjs/core'; import { StudentModule } from './student.module';
async function bootstrap() { const app = await NestFactory.create(StudentModule); app.enableCors(); await app.listen(process.env.PORT || 3002); } bootstrap();
