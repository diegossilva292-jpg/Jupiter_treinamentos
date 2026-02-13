import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { CourseModule as CourseModuleEntity } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Course, CourseModuleEntity, Lesson]),
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule { }
