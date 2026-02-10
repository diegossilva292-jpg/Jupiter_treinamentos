import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Frontend (Vite runs on 5173 by default)
  app.enableCors({
    origin: '*', // For dev simplicity. In production, restrict this.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  await app.listen(3000);
}
bootstrap();
