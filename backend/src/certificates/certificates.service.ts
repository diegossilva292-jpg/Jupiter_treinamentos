import { Injectable, OnModuleInit } from '@nestjs/common';
import { Certificate } from './certificate.entity';
import { FileStoreService } from '../shared/file-store.service';

@Injectable()
export class CertificatesService implements OnModuleInit {
    private certificates: Certificate[] = [];

    constructor(private readonly fileStore: FileStoreService) { }

    onModuleInit() {
        this.certificates = this.fileStore.load<Certificate[]>('certificates.json', []);
    }

    private save() {
        this.fileStore.save('certificates.json', this.certificates);
    }

    issueCertificate(userId: string, userName: string, courseId: string, courseTitle: string): Certificate {
        // Check if already exists to avoid duplicates
        const existing = this.certificates.find(c => c.userId === userId && c.courseId === courseId);
        if (existing) return existing;

        const cert: Certificate = {
            id: `cert_${Date.now()}_${userId}`,
            userId,
            userName,
            courseId,
            courseTitle,
            issuedAt: new Date()
        };
        this.certificates.push(cert);
        this.save();
        console.log(`[Certificates] Issued certificate for user ${userId} on course ${courseId}`);
        return cert;
    }

    findAll(userId?: string): Certificate[] {
        if (userId) {
            return this.certificates.filter(c => c.userId === userId);
        }
        return this.certificates;
    }
}
