import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get('ranking')
    async getRanking(): Promise<User[]> {
        return this.usersService.getRanking();
    }

    @Post(':id/xp')
    async updateXp(@Param('id') id: string, @Body() body: { amount: number }): Promise<void> {
        return this.usersService.updateXp(id, body.amount);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<User | null> {
        return this.usersService.findById(id);
    }

    @Post(':id/category')
    async updateCategory(@Param('id') id: string, @Body() body: { category: string }): Promise<User | null> {
        return this.usersService.updateCategory(id, body.category);
    }
}
