import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdmissionModule } from './admission.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AdmissionModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const swaggerConfig = new DocumentBuilder().setTitle('BrightBoard Admission Service').setDescription('Admission applications and review workflow for BrightBoard').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = Number(process.env.PORT) || 3011;
  await app.listen(port);
  console.log(`Admission service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

void bootstrap();
