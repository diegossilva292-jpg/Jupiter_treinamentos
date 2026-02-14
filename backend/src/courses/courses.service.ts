import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseModule } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private courseRepo: Repository<Course>,
        @InjectRepository(CourseModule)
        private moduleRepo: Repository<CourseModule>,
        @InjectRepository(Lesson)
        private lessonRepo: Repository<Lesson>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async findAll(): Promise<Course[]> {
        return this.courseRepo.find({
            relations: ['modules', 'modules.lessons'],
            order: {
                modules: { order: 'ASC', lessons: { order: 'ASC' } }
            }
        });
    }

    async findOne(id: string): Promise<Course | null> {
        return this.courseRepo.findOne({
            where: { id },
            relations: ['modules', 'modules.lessons']
        });
    }

    async createCourse(data: Partial<Course>): Promise<Course> {
        const newCourse = this.courseRepo.create({
            id: `c${Date.now()}`,
            title: data.title || 'Novo Curso',
            description: data.description || '',
            modules: []
        });
        return this.courseRepo.save(newCourse);
    }

    async updateCourse(id: string, data: Partial<Course>): Promise<Course | null> {
        await this.courseRepo.update(id, data);
        return this.findOne(id);
    }

    async deleteCourse(id: string): Promise<boolean> {
        const result = await this.courseRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async addModule(courseId: string, data: any): Promise<CourseModule | null> {
        const course = await this.findOne(courseId);
        if (!course) return null;

        const newModule = this.moduleRepo.create({
            id: `m${Date.now()}`,
            title: data.title || 'Novo Módulo',
            description: data.description || '',
            courseId: courseId,
            order: course.modules.length + 1,
            lessons: []
        });
        return this.moduleRepo.save(newModule);
    }

    async updateModule(courseId: string, moduleId: string, data: any): Promise<CourseModule | null> {
        await this.moduleRepo.update(moduleId, data);
        return this.moduleRepo.findOne({ where: { id: moduleId }, relations: ['lessons'] });
    }

    async deleteModule(courseId: string, moduleId: string): Promise<boolean> {
        const result = await this.moduleRepo.delete(moduleId);
        return (result.affected ?? 0) > 0;
    }

    async addLesson(courseId: string, moduleId: string, data: any): Promise<Lesson | null> {
        const module = await this.moduleRepo.findOne({
            where: { id: moduleId },
            relations: ['lessons']
        });
        if (!module) return null;

        const newLesson = this.lessonRepo.create({
            id: `l${Date.now()}`,
            title: data.title || 'Nova Aula',
            videoUrl: data.videoUrl || '',
            content: data.content,
            order: module.lessons.length + 1,
            moduleId: moduleId,
            quizId: data.quizId || undefined
        });
        return this.lessonRepo.save(newLesson);
    }

    async updateLesson(courseId: string, moduleId: string, lessonId: string, data: any): Promise<Lesson | null> {
        await this.lessonRepo.update(lessonId, data);
        return this.lessonRepo.findOne({ where: { id: lessonId } });
    }

    async deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<boolean> {
        const result = await this.lessonRepo.delete(lessonId);
        return (result.affected ?? 0) > 0;
    }

    async reorderModules(courseId: string, moduleIds: string[]): Promise<void> {
        for (let i = 0; i < moduleIds.length; i++) {
            await this.moduleRepo.update(moduleIds[i], { order: i + 1 });
        }
    }

    async reorderLessons(courseId: string, moduleId: string, lessonIds: string[]): Promise<void> {
        for (let i = 0; i < lessonIds.length; i++) {
            await this.lessonRepo.update(lessonIds[i], { order: i + 1 });
        }
    }

    async getCoursesForUser(userId: string): Promise<Course[]> {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        if (!user || !user.category) {
            // If user has no category, return all courses
            return this.findAll();
        }

        const allCourses = await this.findAll();

        // Filter courses: include if no categories assigned OR user's category matches
        return allCourses.filter(course =>
            !course.categories?.length || // Course with no categories = available for all
            course.categories.includes(user.category)
        );
    }
}
