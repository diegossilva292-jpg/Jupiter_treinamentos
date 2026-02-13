import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { CourseModule } from './module.entity';
import { Progress } from '../../progress/entities/progress.entity';

@Entity('lessons')
export class Lesson {
    @PrimaryColumn()
    id: string;

    @Column()
    title: string;

    @Column()
    videoUrl: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'int' })
    order: number;

    @Column({ nullable: true })
    quizId: string;

    @Column()
    moduleId: string;

    @ManyToOne(() => CourseModule, module => module.lessons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'moduleId' })
    module: CourseModule;

    @OneToMany(() => Progress, progress => progress.lesson)
    progress: Progress[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
