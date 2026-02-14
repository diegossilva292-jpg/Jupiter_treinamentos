import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Progress } from '../../progress/entities/progress.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';

@Entity('users')
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', length: 20, default: 'student' })
    role: 'admin' | 'student';

    @Column({ nullable: true })
    title: string;

    @Column({ type: 'int', default: 0 })
    xp: number;

    @Column({ nullable: true })
    password: string; // Hash bcrypt (future use)

    @Column({ nullable: true })
    category: string; // tecnico-campo, suporte, marketing, vendas, administrativo, gerencia


    @OneToMany(() => Progress, progress => progress.user)
    progress: Progress[];

    @OneToMany(() => Certificate, certificate => certificate.user)
    certificates: Certificate[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
