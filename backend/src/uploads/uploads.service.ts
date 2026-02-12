import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService implements OnModuleInit {
    async onModuleInit() {
        await this.configureFlussonicCors();
    }

    async configureFlussonicCors() {
        const flussonicUrl = process.env.FLUSSONIC_URL;
        const vodName = process.env.FLUSSONIC_VOD_NAME;
        const flussonicUser = process.env.FLUSSONIC_USER;
        const flussonicPassword = process.env.FLUSSONIC_PASSWORD;

        if (!flussonicUrl || !vodName || !flussonicUser || !flussonicPassword) {
            console.warn('[Flussonic] Config missing, skipping auto-configuration.');
            return;
        }

        const configUrl = `${flussonicUrl}/streamer/api/v3/vods/${vodName}`;
        console.log(`[Flussonic] Attempting to configure CORS at ${configUrl}...`);

        try {
            const auth = Buffer.from(`${flussonicUser}:${flussonicPassword}`).toString('base64');

            // Flussonic V3 API: PUT /streamer/api/v3/vods/{name}
            const response = await fetch(configUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range'
                    }
                }),
            });

            if (response.ok) {
                console.log('[Flussonic] CORS successfully configured!');
            } else {
                const text = await response.text();
                // Don't throw, just log. We don't want to crash the backend if Flussonic is down.
                console.warn(`[Flussonic] Failed to configure CORS: ${response.status} ${text}`);
            }
        } catch (error) {
            console.error('[Flussonic] Error configuring CORS:', error);
        }
    }
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
