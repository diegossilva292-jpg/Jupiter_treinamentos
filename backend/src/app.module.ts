import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressService } from './progress/progress.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { QuizzesModule } from './quizzes/quizzes.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SharedModule } from './shared/shared.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'jupiter_treinamentos',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // DEV only! Disable in production
      logging: ['error', 'warn'], // Log only errors and warnings
      autoLoadEntities: true,
    }),
    SharedModule,
    QuizzesModule,
    CertificatesModule,
    UploadsModule,
    JwtModule.register({
      global: true,
      secret: 'SECRET_KEY_JUPITER',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AppController,
    CoursesController,
    ProgressController,
    UsersController,
  ],
  providers: [AppService, CoursesService, ProgressService, UsersService],
})
export class AppModule { }
