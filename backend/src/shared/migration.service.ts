import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseModule } from '../courses/entities/module.entity';
import { Lesson } from '../courses/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';
import { Certificate } from '../certificates/entities/certificate.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService {
    private readonly dataDir = path.join(__dirname, '../../data');

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Course)
        private courseRepo: Repository<Course>,
        @InjectRepository(CourseModule)
        private moduleRepo: Repository<CourseModule>,
        @InjectRepository(Lesson)
        private lessonRepo: Repository<Lesson>,
        @InjectRepository(Progress)
        private progressRepo: Repository<Progress>,
        @InjectRepository(Certificate)
        private certificateRepo: Repository<Certificate>,
    ) { }

    async migrateAll(): Promise<void> {
        console.log('🚀 Starting data migration from JSON to PostgreSQL...\n');

        try {
            await this.migrateUsers();
            await this.migrateCourses();
            await this.migrateProgress();
            await this.migrateCertificates();

            console.log('\n✅ Migration completed successfully!');
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }

    private async migrateUsers(): Promise<void> {
        console.log('📦 Migrating users...');
        const filePath = path.join(this.dataDir, 'users.json');

        if (!fs.existsSync(filePath)) {
            console.log('⚠️  users.json not found, skipping...');
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const userData of data) {
            const existing = await this.userRepo.findOne({ where: { id: userData.id } });
            if (!existing) {
                await this.userRepo.save(this.userRepo.create(userData));
                console.log(`  ✓ Migrated user: ${userData.name}`);
            } else {
                console.log(`  ⊘ User already exists: ${userData.name}`);
            }
        }

        console.log(`✅ Users migrated: ${data.length} total\n`);
    }

    private async migrateCourses(): Promise<void> {
        console.log('📦 Migrating courses...');
        const filePath = path.join(this.dataDir, 'courses.json');

        if (!fs.existsSync(filePath)) {
            console.log('⚠️  courses.json not found, skipping...');
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const courseData of data) {
            const existing = await this.courseRepo.findOne({ where: { id: courseData.id } });
            if (existing) {
                console.log(`  ⊘ Course already exists: ${courseData.title}`);
                continue;
            }

            // Create course
            const course = this.courseRepo.create({
                id: courseData.id,
                title: courseData.title,
                description: courseData.description,
            });
            await this.courseRepo.save(course);
            console.log(`  ✓ Migrated course: ${courseData.title}`);

            // Migrate modules and lessons
            if (courseData.modules && courseData.modules.length > 0) {
                for (const moduleData of courseData.modules) {
                    const module = this.moduleRepo.create({
                        id: moduleData.id,
                        title: moduleData.title,
                        description: moduleData.description || '',
                        order: moduleData.order,
                        courseId: courseData.id,
                    });
                    await this.moduleRepo.save(module);
                    console.log(`    ✓ Module: ${moduleData.title}`);

                    // Migrate lessons
                    if (moduleData.lessons && moduleData.lessons.length > 0) {
                        for (const lessonData of moduleData.lessons) {
                            const lesson = this.lessonRepo.create({
                                id: lessonData.id,
                                title: lessonData.title,
                                videoUrl: lessonData.videoUrl,
                                content: lessonData.content || '',
                                order: lessonData.order,
                                quizId: lessonData.quizId,
                                moduleId: moduleData.id,
                            });
                            await this.lessonRepo.save(lesson);
                            console.log(`      ✓ Lesson: ${lessonData.title}`);
                        }
                    }
                }
            }
        }

        console.log(`✅ Courses migrated: ${data.length} total\n`);
    }

    private async migrateProgress(): Promise<void> {
        console.log('📦 Migrating progress...');
        const filePath = path.join(this.dataDir, 'progress.json');

        if (!fs.existsSync(filePath)) {
            console.log('⚠️  progress.json not found, skipping...');
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        let migrated = 0;
        let skipped = 0;

        for (const progressData of data) {
            // Validate user exists
            const userExists = await this.userRepo.findOne({ where: { id: progressData.userId } });
            if (!userExists) {
                console.log(`  ⊘ Skipped: userId ${progressData.userId} not found`);
                skipped++;
                continue;
            }

            // Validate lesson exists
            const lessonExists = await this.lessonRepo.findOne({ where: { id: progressData.lessonId } });
            if (!lessonExists) {
                console.log(`  ⊘ Skipped: lessonId ${progressData.lessonId} not found`);
                skipped++;
                continue;
            }

            const existing = await this.progressRepo.findOne({
                where: { userId: progressData.userId, lessonId: progressData.lessonId }
            });

            if (!existing) {
                await this.progressRepo.save(this.progressRepo.create({
                    userId: progressData.userId,
                    lessonId: progressData.lessonId,
                    status: progressData.status || 'COMPLETED',
                    score: progressData.score || 0,
                }));
                console.log(`  ✓ Migrated progress for user ${progressData.userId}`);
                migrated++;
            }
        }

        console.log(`✅ Progress migrated: ${migrated} migrated, ${skipped} skipped\n`);
    }

    private async migrateCertificates(): Promise<void> {
        console.log('📦 Migrating certificates...');
        const filePath = path.join(this.dataDir, 'certificates.json');

        if (!fs.existsSync(filePath)) {
            console.log('⚠️  certificates.json not found, skipping...');
            return;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        let migrated = 0;
        let skipped = 0;

        for (const certData of data) {
            // Validate user exists
            const userExists = await this.userRepo.findOne({ where: { id: certData.userId } });
            if (!userExists) {
                console.log(`  ⊘ Skipped: userId ${certData.userId} not found`);
                skipped++;
                continue;
            }

            // Validate course exists
            const courseExists = await this.courseRepo.findOne({ where: { id: certData.courseId } });
            if (!courseExists) {
                console.log(`  ⊘ Skipped: courseId ${certData.courseId} not found`);
                skipped++;
                continue;
            }

            const existing = await this.certificateRepo.findOne({
                where: { userId: certData.userId, courseId: certData.courseId }
            });

            if (!existing) {
                await this.certificateRepo.save(this.certificateRepo.create({
                    userId: certData.userId,
                    courseId: certData.courseId,
                    issuedAt: new Date(certData.issuedAt),
                }));
                console.log(`  ✓ Migrated certificate for user ${certData.userId}`);
                migrated++;
            }
        }

        console.log(`✅ Certificates migrated: ${migrated} migrated, ${skipped} skipped\n`);
    }

    async clearDatabase(): Promise<void> {
        console.log('🗑️  Clearing database...');
        await this.progressRepo.clear();
        await this.certificateRepo.clear();
        await this.lessonRepo.clear();
        await this.moduleRepo.clear();
        await this.courseRepo.clear();
        await this.userRepo.clear();
        console.log('✅ Database cleared\n');
    }
}
