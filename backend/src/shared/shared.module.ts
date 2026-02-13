import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStoreService } from './file-store.service';
import { MigrationService } from './migration.service';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseModule as CourseModuleEntity } from '../courses/entities/module.entity';
import { Lesson } from '../courses/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';
import { Certificate } from '../certificates/entities/certificate.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Course,
            CourseModuleEntity,
            Lesson,
            Progress,
            Certificate,
        ]),
    ],
    providers: [FileStoreService, MigrationService],
    exports: [FileStoreService, MigrationService],
})
export class SharedModule { }
