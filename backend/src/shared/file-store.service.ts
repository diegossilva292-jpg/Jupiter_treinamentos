import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStoreService {
    private dataDir = path.join(process.cwd(), 'data');

    constructor() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir);
        }
    }

    save<T>(filename: string, data: T): void {
        const filePath = path.join(this.dataDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    load<T>(filename: string, defaultValue: T): T {
        const filePath = path.join(this.dataDir, filename);
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            try {
                return JSON.parse(fileContent) as T;
            } catch (error) {
                console.error(`Error parsing ${filename}:`, error);
                return defaultValue;
            }
        }
        return defaultValue;
    }
}
