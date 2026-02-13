import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../courses/entities/lesson.entity';

@Entity('progress')
@Index(['userId', 'lessonId'], { unique: true })
export class Progress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    lessonId: string;

    @Column({ type: 'varchar', length: 20, default: 'COMPLETED' })
    status: 'COMPLETED' | 'IN_PROGRESS';

    @Column({ type: 'int', nullable: true })
    score: number;

    @ManyToOne(() => User, user => user.progress, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Lesson, lesson => lesson.progress, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
