import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
      new ValidationPipe({
          disableErrorMessages: false,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          transform: true,
      }),
  );

  const options = new DocumentBuilder()
      .setTitle('Sample App')
      .setDescription('API description')
      .setVersion('1.0')
      .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('explorer', app, document);
  await app.listen(3000);
}
bootstrap();
