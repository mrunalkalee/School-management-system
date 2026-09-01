import { NestFactory } from '@nestjs/core'; import { LeaveModule } from './leave.module';
async function bootstrap() { const app = await NestFactory.create(LeaveModule); app.enableCors(); await app.listen(process.env.PORT || 3010); } bootstrap();
