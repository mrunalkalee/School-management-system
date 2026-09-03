import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LeaveModule } from './leave.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(LeaveModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BrightBoard Leave Service')
    .setDescription('Student and teacher leave requests and review workflow for BrightBoard')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = Number(process.env.PORT) || 3010;
  await app.listen(port);
  console.log(`Leave service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}

void bootstrap();
