import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async findAll(): Promise<User[]> {
        return this.userRepo.find();
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepo.create(userData);
        return this.userRepo.save(user);
    }

    async updateXp(userId: string, amount: number): Promise<void> {
        const user = await this.findById(userId);
        if (user) {
            user.xp = (user.xp || 0) + amount;
            await this.userRepo.save(user);
        }
    }

    async getRanking(): Promise<User[]> {
        return this.userRepo.find({
            order: { xp: 'DESC' },
            take: 10
        });
    }
}
