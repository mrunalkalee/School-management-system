import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GatewayModule);
  const port = Number(process.env.PORT) || 3100;
  await app.listen(port);
  console.log(`API Gateway running at http://localhost:${port}`);
  console.log(`Service documentation index available at http://localhost:${port}/`);
}

void bootstrap();
