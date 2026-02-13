import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import type { Express } from 'express';
import 'multer'; // Ensure multer types are loaded
import { AuthGuard } from '../shared/auth.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';

@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
        }

        const videoUrl = await this.uploadsService.uploadToFlussonic(file);
        return { url: videoUrl };
    }
}
