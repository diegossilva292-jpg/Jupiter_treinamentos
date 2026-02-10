export class Lesson {
    id: string;
    title: string;
    videoUrl: string;
    content?: string;
    order: number;
    quizId?: string;
    moduleId: string;
}

export class CourseModule {
    id: string;
    title: string;
    description: string;
    order: number;
    courseId: string;
    lessons: Lesson[];
}

export class Course {
    id: string;
    title: string;
    description: string;
    modules: CourseModule[];
}
