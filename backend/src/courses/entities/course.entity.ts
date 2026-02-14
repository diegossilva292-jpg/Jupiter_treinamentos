import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CourseModule } from './module.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';

@Entity('courses')
export class Course {
    @PrimaryColumn()
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column('simple-array', { nullable: true, default: '' })
    categories: string[]; // tecnico-campo, suporte, marketing, etc


    @OneToMany(() => CourseModule, module => module.course, { cascade: true, eager: true })
    modules: CourseModule[];

    @OneToMany(() => Certificate, certificate => certificate.course)
    certificates: Certificate[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
