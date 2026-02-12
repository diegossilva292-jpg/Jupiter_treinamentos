import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

@Module({
    imports: [
        MulterModule.register({
            limits: {
                fileSize: 500 * 1024 * 1024, // 500MB
            },
        }),
    ],
    controllers: [UploadsController],
    providers: [UploadsService],
})
export class UploadsModule { }
