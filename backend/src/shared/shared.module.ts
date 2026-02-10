import { Module, Global } from '@nestjs/common';
import { FileStoreService } from './file-store.service';

@Global()
@Module({
    providers: [FileStoreService],
    exports: [FileStoreService],
})
export class SharedModule { }
