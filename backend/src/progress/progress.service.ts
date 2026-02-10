import { Injectable, OnModuleInit } from '@nestjs/common';
import { Progress, ProgressStatus } from './progress.entity';
import { CoursesService } from '../courses/courses.service';
import { CertificatesService } from '../certificates/certificates.service';
import { UsersService } from '../users/users.service';
import { Course } from '../courses/entities/course.entity';
import { FileStoreService } from '../shared/file-store.service';

@Injectable()
export class ProgressService implements OnModuleInit {
    private progressStore: Progress[] = [];

    constructor(
        private readonly coursesService: CoursesService,
        private readonly certificatesService: CertificatesService,
        private readonly usersService: UsersService,
        private readonly fileStore: FileStoreService
    ) { }

    onModuleInit() {
        this.progressStore = this.fileStore.load<Progress[]>('progress.json', []);
    }

    private save() {
        this.fileStore.save('progress.json', this.progressStore);
    }

    markCompleted(userId: string, lessonId: string): Progress {
        return this.recordAttempt(userId, lessonId, 0, true); // Legacy support or manual override
    }

    recordAttempt(userId: string, lessonId: string, score: number, forceComplete = false): Progress {
        let progress = this.progressStore.find(
            (p) => p.userId === userId && p.lessonId === lessonId,
        );

        if (!progress) {
            progress = {
                userId,
                lessonId,
                status: ProgressStatus.PENDING,
                completedAt: new Date(),
                attempts: 0,
                score: 0
            };
            this.progressStore.push(progress);
        }

        // Increment attempts
        progress.attempts = (progress.attempts || 0) + 1;

        // Update score if better (or just last? Let's keep last for now to reflect latest attempt)
        progress.score = score;

        // Check if passed
        if (score >= 4 || forceComplete) {
            progress.status = ProgressStatus.COMPLETED;
            progress.completedAt = new Date(); // Update completion time

            // Check for Course Completion only if passed
            this.checkAndIssueCertificate(userId, lessonId);
        }

        this.save();
        return progress;
    }

    private checkAndIssueCertificate(userId: string, completedLessonId: string) {
        // 1. Find which course this lesson belongs to
        const courses = this.coursesService.findAll();
        let targetCourse: Course | null = null;

        for (const course of courses) {
            for (const module of course.modules) {
                if (module.lessons.some(l => l.id === completedLessonId)) {
                    targetCourse = course;
                    break;
                }
            }
            if (targetCourse) break;
        }

        if (!targetCourse) return;

        // 2. Check if ALL lessons in this course are completed
        const allLessonIds = targetCourse.modules.flatMap(m => m.lessons.map(l => l.id));
        const userProgress = this.getUserProgress(userId);

        const completedLessonIds = new Set(
            userProgress
                .filter(p => p.status === ProgressStatus.COMPLETED)
                .map(p => p.lessonId)
        );

        const isCourseCompleted = allLessonIds.every(id => completedLessonIds.has(id));

        if (isCourseCompleted) {
            // New check: Prevent duplicate XP/Certificate
            const existingCerts = this.certificatesService.findAll(userId);
            const alreadyHasCert = existingCerts.some(c => c.courseId === targetCourse!.id);

            if (alreadyHasCert) {
                console.log(`[Progress] User ${userId} already has certificate for course ${targetCourse.id}. Skipping XP award.`);
                return;
            }

            // 3. Issue Certificate & Award XP
            const user = this.usersService.findById(userId);
            const userName = user ? user.name : 'Aluno';

            this.certificatesService.issueCertificate(
                userId,
                userName,
                targetCourse.id,
                targetCourse.title
            );

            // Award XP (e.g., 10 for course completion)
            if (user) {
                this.usersService.updateXp(userId, 10);
                console.log(`[Progress] Awarded 10 XP to user ${userId} for completing course ${targetCourse.title}`);
            }
        }
    }

    // Obter progresso de um usuário
    getUserProgress(userId: string): Progress[] {
        return this.progressStore.filter((p) => p.userId === userId);
    }

    // Obter todo o progresso (para Admin)
    getAllProgress(): Progress[] {
        return this.progressStore;
    }
}
