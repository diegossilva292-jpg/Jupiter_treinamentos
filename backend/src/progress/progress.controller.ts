import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { Progress } from './entities/progress.entity';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @Post()
    async markCompleted(@Body() body: { userId: string; lessonId: string }): Promise<Progress> {
        return this.progressService.markCompleted(body.userId, body.lessonId);
    }

    @Post('attempt')
    async recordAttempt(@Body() body: { userId: string; lessonId: string; score: number }): Promise<Progress> {
        return this.progressService.recordAttempt(body.userId, body.lessonId, body.score);
    }

    @Get(':userId')
    async getUserProgress(@Param('userId') userId: string): Promise<Progress[]> {
        return this.progressService.getUserProgress(userId);
    }

    @Get()
    async getAllProgress(): Promise<Progress[]> {
        return this.progressService.getAllProgress();
    }
}
