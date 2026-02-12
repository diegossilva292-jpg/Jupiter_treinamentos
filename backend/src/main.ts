import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body limit for video uploads
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ extended: true, limit: '500mb' }));

  // Enable CORS for Frontend (Vite runs on 5173 by default)
  app.enableCors({
    origin: '*', // For dev simplicity. In production, restrict this.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
