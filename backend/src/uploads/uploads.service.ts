import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
    async uploadToFlussonic(file: Express.Multer.File): Promise<string> {
        const flussonicUrl = process.env.FLUSSONIC_URL;
        const flussonicUser = process.env.FLUSSONIC_USER;
        const flussonicPassword = process.env.FLUSSONIC_PASSWORD;
        const vodName = process.env.FLUSSONIC_VOD_NAME;

        if (!flussonicUrl || !flussonicUser || !flussonicPassword || !vodName) {
            throw new HttpException('Flussonic configuration missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Generate UUID filename
        const fileExtension = file.originalname.split('.').pop();
        const cleanFilename = `${uuidv4()}.${fileExtension}`;
        const uploadUrl = `${flussonicUrl}/streamer/api/v3/vods/${vodName}/storages/0/files/${cleanFilename}`;

        console.log(`Uploading to Flussonic: ${uploadUrl}`);

        try {
            const auth = Buffer.from(`${flussonicUser}:${flussonicPassword}`).toString('base64');

            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': file.mimetype,
                },
                body: file.buffer as any,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Flussonic upload failed:', response.status, errorText);
                throw new HttpException(`Flussonic upload failed: ${response.statusText}`, HttpStatus.BAD_GATEWAY);
            }

            // Return the HLS URL for playback
            // URL Format: FLUSSONIC_URL/VOD_NAME/FILENAME/index.m3u8
            return `${flussonicUrl}/${vodName}/${cleanFilename}/index.m3u8`;

        } catch (error) {
            console.error('Upload error:', error);
            throw new HttpException('Failed to upload video', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
