// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const config = new DocumentBuilder().setTitle("Nuestra API")
//   .setDescription("Ejemplo de documentación de un REST API en Swagger")
//   .setVersion("1.0").build();
//   const doc = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup("docs", app, doc);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar límites de tamaño de solicitud
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3002', 'http://127.0.0.1:3002'],
    credentials: true,
  });

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('oFRAUD API')
    .setDescription('API del sistema oFRAUD para reportes de fraudes')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación de usuarios')
    .addTag('users', 'Gestión de usuarios')
    .addTag('reports', 'Gestión de reportes')
    .addTag('help-requests', 'Solicitudes de ayuda')
    .addTag('files', 'Subida de archivos')
    .addTag('admin', 'Funciones administrativas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();