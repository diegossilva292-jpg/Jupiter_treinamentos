import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { Progress } from './progress.entity';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @Post()
    markCompleted(@Body() body: { userId: string; lessonId: string }): Progress {
        return this.progressService.markCompleted(body.userId, body.lessonId);
    }

    @Post('attempt')
    recordAttempt(@Body() body: { userId: string; lessonId: string; score: number }): Progress {
        return this.progressService.recordAttempt(body.userId, body.lessonId, body.score);
    }

    @Get(':userId')
    getUserProgress(@Param('userId') userId: string): Progress[] {
        return this.progressService.getUserProgress(userId);
    }

    @Get()
    getAllProgress(): Progress[] {
        return this.progressService.getAllProgress();
    }
}
