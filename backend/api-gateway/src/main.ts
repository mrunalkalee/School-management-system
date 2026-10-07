import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GatewayModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });
  const port = Number(process.env.PORT) || 3100;
  await app.listen(port);
  console.log(`API Gateway running at http://localhost:${port}`);
  console.log(`Service documentation index available at http://localhost:${port}/`);
}

void bootstrap();
