import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course, CourseModule, Lesson } from './entities/course.entity';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    findAll(): Course[] {
        return this.coursesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Course | undefined {
        return this.coursesService.findOne(id);
    }

    @Post()
    create(@Body() createCourseDto: Partial<Course>) {
        return this.coursesService.createCourse(createCourseDto);
    }

    @Post(':id/modules')
    createModule(@Param('id') id: string, @Body() createModuleDto: any) {
        return this.coursesService.addModule(id, createModuleDto);
    }

    @Post(':id/modules/:moduleId/lessons')
    addLesson(@Param('id') id: string, @Param('moduleId') moduleId: string, @Body() createLessonDto: any) {
        return this.coursesService.addLesson(id, moduleId, createLessonDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coursesService.deleteCourse(id);
    }
}
