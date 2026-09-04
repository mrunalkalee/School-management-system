import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LibraryModule } from './library.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(LibraryModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BrightBoard Library Service')
    .setDescription('Book catalog, issues, returns, and borrower library history for BrightBoard')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT) || 3014;
  await app.listen(port);
  console.log(`Library service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

void bootstrap();
