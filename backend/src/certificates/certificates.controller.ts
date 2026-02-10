import { Controller, Get, Param, Query } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { Certificate } from './certificate.entity';

@Controller('certificates')
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    @Get()
    findAll(@Query('userId') userId?: string): Certificate[] {
        return this.certificatesService.findAll(userId);
    }

    @Get(':userId')
    findByUser(@Param('userId') userId: string): Certificate[] {
        return this.certificatesService.findAll(userId);
    }
}
