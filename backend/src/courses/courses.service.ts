import { Injectable, OnModuleInit } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { FileStoreService } from '../shared/file-store.service';

@Injectable()
export class CoursesService implements OnModuleInit {
    private courses: Course[] = [];

    constructor(private readonly fileStore: FileStoreService) { }

    onModuleInit() {
        this.courses = this.fileStore.load<Course[]>('courses.json', []);
    }

    private save() {
        this.fileStore.save('courses.json', this.courses);
    }

    findAll(): Course[] {
        return this.courses;
    }

    findOne(id: string): Course | undefined {
        return this.courses.find((c) => c.id === id);
    }

    createCourse(data: Partial<Course>): Course {
        const newCourse: Course = {
            id: `c${Date.now()}`,
            title: data.title || 'Novo Curso',
            description: data.description || '',
            modules: []
        };
        this.courses.push(newCourse);
        this.save();
        return newCourse;
    }

    addModule(courseId: string, data: any): any {
        const course = this.findOne(courseId);
        if (!course) return null;

        const newModule = {
            id: `m${Date.now()}`,
            title: data.title || 'Novo Módulo',
            description: data.description || '',
            courseId: courseId,
            order: course.modules.length + 1,
            lessons: []
        };
        course.modules.push(newModule);
        this.save();
        return newModule;
    }

    addLesson(courseId: string, moduleId: string, data: any): any {
        const course = this.findOne(courseId);
        if (!course) return null;

        const module = course.modules.find(m => m.id === moduleId);
        if (!module) return null;

        const newLesson = {
            id: `l${Date.now()}`,
            title: data.title || 'Nova Aula',
            videoUrl: data.videoUrl || '',
            content: data.content,
            order: module.lessons.length + 1,
            moduleId: moduleId,
            quizId: data.quizId || undefined
        };
        module.lessons.push(newLesson);
        this.save();
        return newLesson;
    }

    deleteCourse(id: string): boolean {
        const index = this.courses.findIndex(c => c.id === id);
        if (index !== -1) {
            this.courses.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
}
