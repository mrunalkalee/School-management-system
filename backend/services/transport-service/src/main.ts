import { NestFactory } from '@nestjs/core'; import { TransportRouteModule } from './transport.module';
async function bootstrap() { const app = await NestFactory.create(TransportRouteModule); app.enableCors(); await app.listen(process.env.PORT || 3012); } bootstrap();
