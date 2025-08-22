import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-initdata', // название хедера
        in: 'header',
      },
      'x-initdata', // security name
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });

  document.paths = Object.entries(document.paths).reduce(
    (paths, [path, methods]) => {
      for (const method of Object.values(methods)) {
        if (!method.security) {
          method.security = [{ 'x-initdata': [] }];
        }
      }
      paths[path] = methods;
      return paths;
    },
    {},
  );

  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
