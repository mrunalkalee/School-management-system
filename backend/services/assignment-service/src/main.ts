import { NestFactory } from '@nestjs/core'; import { AssignmentModule } from './assignment.module';
async function bootstrap() { const app = await NestFactory.create(AssignmentModule); app.enableCors(); await app.listen(process.env.PORT || 3007); } bootstrap();
