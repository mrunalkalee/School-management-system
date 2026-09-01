import { NestFactory } from '@nestjs/core'; import { DashboardSnapshotModule } from './dashboard.module';
async function bootstrap() { const app = await NestFactory.create(DashboardSnapshotModule); app.enableCors(); await app.listen(process.env.PORT || 3016); } bootstrap();
