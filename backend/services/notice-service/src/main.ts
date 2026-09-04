import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NoticeModule } from './notice.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(NoticeModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const swaggerConfig = new DocumentBuilder().setTitle('BrightBoard Notice Service').setDescription('School notices and events for BrightBoard').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = Number(process.env.PORT) || 3013;
  await app.listen(port);
  console.log(`Notice service running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}
void bootstrap();
