import { INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main', true);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidUnknownValues: true }));
  createSwaggerDoc(app);
  await app.listen(3000);
  const url = await app.getUrl();
  Logger.log('Listening on ' + url, 'App');
  Logger.log(`Swagger UI on ${url}/api`, 'App');
}
bootstrap();

function createSwaggerDoc(app: INestApplication) {
  const globalPrefix: string = '/api';
  const swaggerOptions = new DocumentBuilder()
    .setTitle('01-nestx-auth')
    .setDescription('The nestx-auth sample app API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(`${globalPrefix}`, app, swaggerDoc);
}
