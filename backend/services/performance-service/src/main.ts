import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PerformanceModule } from './performance.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(PerformanceModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BrightBoard Performance Service')
    .setDescription('HTTP-only aggregation of attendance and examination performance for BrightBoard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT) || 3007;
  await app.listen(port);
  console.log(`Performance service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

void bootstrap();
