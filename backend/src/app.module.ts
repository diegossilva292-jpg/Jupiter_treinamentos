import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
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
