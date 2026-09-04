import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransportModule } from './transport.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(TransportModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BrightBoard Transport Service')
    .setDescription('Transport routes and student bus allocations for BrightBoard')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT) || 3015;
  await app.listen(port);
  console.log(`Transport service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

void bootstrap();
