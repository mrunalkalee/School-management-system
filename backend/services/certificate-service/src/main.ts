import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CertificateModule } from './certificate.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(CertificateModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const swaggerConfig = new DocumentBuilder().setTitle('BrightBoard Certificate Service').setDescription('Student certificate issuing and lookup for BrightBoard').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = Number(process.env.PORT) || 3012;
  await app.listen(port);
  console.log(`Certificate service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

void bootstrap();
