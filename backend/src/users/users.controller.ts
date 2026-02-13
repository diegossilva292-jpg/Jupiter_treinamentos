import { Body, Controller, Get, Param, Post, Delete, UseGuards, Put } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { AuthGuard } from '../shared/auth.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(): User[] {
        return this.usersService.findAll();
    }

    @Get('ranking')
    getRanking(): User[] {
        return this.usersService.getRanking();
    }

    @Post(':id/xp')
    updateXp(@Param('id') id: string, @Body() body: { amount: number }): User | undefined {
        return this.usersService.updateXp(id, body.amount);
    }

    @Get(':id')
    findById(@Param('id') id: string): User | undefined {
        return this.usersService.findById(id);
    }

    @Post('login')
    async login(@Body() body: any) {
        return this.usersService.loginProxy(body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
