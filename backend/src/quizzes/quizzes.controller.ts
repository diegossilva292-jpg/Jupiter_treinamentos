import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './quiz.entity';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Get()
    findAll(): Quiz[] {
        return this.quizzesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Quiz | undefined {
        return this.quizzesService.findOne(id);
    }

    @Post()
    create(@Body() createQuizDto: any) {
        return this.quizzesService.createQuiz(createQuizDto);
    }
}
