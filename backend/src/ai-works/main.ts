import { NestFactory } from '@nestjs/core';
import { AiWorkerModule } from './ai-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(AiWorkerModule);
  await app.listen(4001); // отдельный порт
}
bootstrap();
