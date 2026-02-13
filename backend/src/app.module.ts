import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizzesModule } from './quizzes/quizzes.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SharedModule } from './shared/shared.module';
import { UploadsModule } from './uploads/uploads.module';
import { CoursesModule } from './courses/courses.module';
import { UsersModule } from './users/users.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'jupiter_treinamentos',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // DEV only! Disable in production
      logging: ['error', 'warn'],
      autoLoadEntities: true,
    }),
    SharedModule,
    CoursesModule,
    UsersModule,
    ProgressModule,
    QuizzesModule,
    CertificatesModule,
    UploadsModule,
    JwtModule.register({
      global: true,
      secret: 'SECRET_KEY_JUPITER',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
