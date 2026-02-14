import { Controller, Get, Param, Post, Body, Delete, UseGuards, Patch } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course, CourseModule, Lesson } from './entities';
import { AuthGuard } from '../shared/auth.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    async findAll(): Promise<Course[]> {
        return this.coursesService.findAll();
    }

    @Get('user/:userId')
    async getCoursesForUser(@Param('userId') userId: string): Promise<Course[]> {
        return this.coursesService.getCoursesForUser(userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Course | null> {
        return this.coursesService.findOne(id);
    }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async create(@Body() createCourseDto: Partial<Course>) {
        return this.coursesService.createCourse(createCourseDto);
    }

    @Post(':id/modules')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async createModule(@Param('id') id: string, @Body() createModuleDto: any) {
        return this.coursesService.addModule(id, createModuleDto);
    }

    @Post(':id/modules/:moduleId/lessons')
    async addLesson(@Param('id') id: string, @Param('moduleId') moduleId: string, @Body() createLessonDto: any) {
        return this.coursesService.addLesson(id, moduleId, createLessonDto);
    }

    @Patch(':id/modules/reorder')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async reorderModules(@Param('id') id: string, @Body() body: { moduleIds: string[] }) {
        return this.coursesService.reorderModules(id, body.moduleIds);
    }

    @Patch(':id/modules/:moduleId/lessons/reorder')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async reorderLessons(@Param('id') id: string, @Param('moduleId') moduleId: string, @Body() body: { lessonIds: string[] }) {
        return this.coursesService.reorderLessons(id, moduleId, body.lessonIds);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async remove(@Param('id') id: string) {
        return this.coursesService.deleteCourse(id);
    }

    // ========== NEW CRUD ENDPOINTS ==========

    /**
     * Update course details
     */
    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async updateCourse(@Param('id') id: string, @Body() updateData: Partial<Course>) {
        return this.coursesService.updateCourse(id, updateData);
    }

    /**
     * Update module details
     */
    @Patch(':id/modules/:moduleId')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async updateModule(@Param('id') id: string, @Param('moduleId') moduleId: string, @Body() updateData: any) {
        return this.coursesService.updateModule(id, moduleId, updateData);
    }

    /**
     * Delete a module
     */
    @Delete(':id/modules/:moduleId')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async deleteModule(@Param('id') id: string, @Param('moduleId') moduleId: string) {
        return this.coursesService.deleteModule(id, moduleId);
    }

    /**
     * Update lesson details
     */
    @Patch(':id/modules/:moduleId/lessons/:lessonId')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async updateLesson(
        @Param('id') id: string,
        @Param('moduleId') moduleId: string,
        @Param('lessonId') lessonId: string,
        @Body() updateData: any
    ) {
        return this.coursesService.updateLesson(id, moduleId, lessonId, updateData);
    }

    /**
     * Delete a lesson
     */
    @Delete(':id/modules/:moduleId/lessons/:lessonId')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    async deleteLesson(
        @Param('id') id: string,
        @Param('moduleId') moduleId: string,
        @Param('lessonId') lessonId: string
    ) {
        return this.coursesService.deleteLesson(id, moduleId, lessonId);
    }
}
