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

    reorderModules(courseId: string, moduleIds: string[]): boolean {
        const course = this.findOne(courseId);
        if (!course) return false;

        const modulesMap = new Map(course.modules.map(m => [m.id, m]));
        const newModules = moduleIds.map(id => modulesMap.get(id)).filter((m): m is any => !!m);

        if (newModules.length !== course.modules.length) {
            // Handle case where some modules might be missing or ids are wrong
            // For now, valid ids take precedence, remaining appended? 
            // Simpler: Just rely on the passed IDs if they match the count, or just reorder what is passed.
            // Better strategy: Reconstruct the array based on IDs. Appending any missing ones at the end.
            const remaining = course.modules.filter(m => !moduleIds.includes(m.id));
            course.modules = [...newModules, ...remaining];
        } else {
            course.modules = newModules;
        }

        // Update order index
        course.modules.forEach((m, index) => m.order = index + 1);
        this.save();
        return true;
    }

    reorderLessons(courseId: string, moduleId: string, lessonIds: string[]): boolean {
        const course = this.findOne(courseId);
        if (!course) return false;

        const module = course.modules.find(m => m.id === moduleId);
        if (!module) return false;

        const lessonsMap = new Map(module.lessons.map(l => [l.id, l]));
        const newLessons = lessonIds.map(id => lessonsMap.get(id)).filter((l): l is any => !!l);

        const remaining = module.lessons.filter(l => !lessonIds.includes(l.id));
        module.lessons = [...newLessons, ...remaining];

        // Update order index
        module.lessons.forEach((l, index) => l.order = index + 1);
        this.save();
        return true;
    }

    updateCourse(courseId: string, updateData: Partial<Course>): Course | null {
        const course = this.findOne(courseId);
        if (!course) return null;

        if (updateData.title) course.title = updateData.title;
        if (updateData.description !== undefined) course.description = updateData.description;

        this.save();
        return course;
    }

    updateModule(courseId: string, moduleId: string, updateData: any): any {
        const course = this.findOne(courseId);
        if (!course) return null;

        const module = course.modules.find(m => m.id === moduleId);
        if (!module) return null;

        if (updateData.title) module.title = updateData.title;
        if (updateData.description !== undefined) module.description = updateData.description;

        this.save();
        return module;
    }

    deleteModule(courseId: string, moduleId: string): boolean {
        const course = this.findOne(courseId);
        if (!course) return false;

        const index = course.modules.findIndex(m => m.id === moduleId);
        if (index === -1) return false;

        course.modules.splice(index, 1);
        // Update order for remaining modules
        course.modules.forEach((m, idx) => m.order = idx + 1);
        this.save();
        return true;
    }

    updateLesson(courseId: string, moduleId: string, lessonId: string, updateData: any): any {
        const course = this.findOne(courseId);
        if (!course) return null;

        const module = course.modules.find(m => m.id === moduleId);
        if (!module) return null;

        const lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson) return null;

        if (updateData.title) lesson.title = updateData.title;
        if (updateData.videoUrl) lesson.videoUrl = updateData.videoUrl;
        if (updateData.content !== undefined) lesson.content = updateData.content;
        if (updateData.quizId !== undefined) lesson.quizId = updateData.quizId;

        this.save();
        return lesson;
    }

    deleteLesson(courseId: string, moduleId: string, lessonId: string): boolean {
        const course = this.findOne(courseId);
        if (!course) return false;

        const module = course.modules.find(m => m.id === moduleId);
        if (!module) return false;

        const index = module.lessons.findIndex(l => l.id === lessonId);
        if (index === -1) return false;

        module.lessons.splice(index, 1);
        // Update order for remaining lessons
        module.lessons.forEach((l, idx) => l.order = idx + 1);
        this.save();
        return true;
    }
}
