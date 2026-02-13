import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { CoursesService } from '../courses/courses.service';
import { CertificatesService } from '../certificates/certificates.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private progressRepo: Repository<Progress>,
        private readonly coursesService: CoursesService,
        private readonly certificatesService: CertificatesService,
        private readonly usersService: UsersService,
    ) { }

    async markCompleted(userId: string, lessonId: string): Promise<Progress> {
        return this.recordAttempt(userId, lessonId, 0, true);
    }

    async recordAttempt(userId: string, lessonId: string, score: number, forceComplete = false): Promise<Progress> {
        let progress = await this.progressRepo.findOne({
            where: { userId, lessonId }
        });

        if (!progress) {
            progress = this.progressRepo.create({
                userId,
                lessonId,
                status: 'IN_PROGRESS',
                score: 0
            });
        }

        // Update score
        progress.score = score;

        // Check if passed
        if (score >= 4 || forceComplete) {
            progress.status = 'COMPLETED';

            // Check for Course Completion
            await this.checkAndIssueCertificate(userId, lessonId);
        }

        return this.progressRepo.save(progress);
    }

    private async checkAndIssueCertificate(userId: string, completedLessonId: string) {
        // 1. Find which course this lesson belongs to
        const courses = await this.coursesService.findAll();
        let targetCourse: Awaited<ReturnType<typeof this.coursesService.findOne>> = null;

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
        const userProgress = await this.getUserProgress(userId);

        const completedLessonIds = new Set(
            userProgress
                .filter(p => p.status === 'COMPLETED')
                .map(p => p.lessonId)
        );

        const isCourseCompleted = allLessonIds.every(id => completedLessonIds.has(id));

        if (isCourseCompleted) {
            // Check for existing certificate
            const existingCerts = this.certificatesService.findAll(userId);
            const alreadyHasCert = existingCerts.some(c => c.courseId === targetCourse.id);

            if (alreadyHasCert) {
                console.log(`[Progress] User ${userId} already has certificate for course ${targetCourse.id}`);
                return;
            }

            // 3. Issue Certificate & Award XP
            const user = await this.usersService.findById(userId);
            const userName = user ? user.name : 'Aluno';

            this.certificatesService.issueCertificate(
                userId,
                userName,
                targetCourse.id,
                targetCourse.title
            );

            // Award XP
            if (user) {
                await this.usersService.updateXp(userId, 10);
                console.log(`[Progress] Awarded 10 XP to user ${userId} for completing course ${targetCourse.title}`);
            }
        }
    }

    async getUserProgress(userId: string): Promise<Progress[]> {
        return this.progressRepo.find({ where: { userId } });
    }

    async getAllProgress(): Promise<Progress[]> {
        return this.progressRepo.find();
    }
}
