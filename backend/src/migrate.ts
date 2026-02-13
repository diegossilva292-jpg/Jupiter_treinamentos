import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrationService } from './shared/migration.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);

    try {
        console.log('═══════════════════════════════════════');
        console.log('  DATABASE MIGRATION TOOL');
        console.log('  JSON → PostgreSQL');
        console.log('═══════════════════════════════════════\n');

        const args = process.argv.slice(2);

        if (args.includes('--clear')) {
            await migrationService.clearDatabase();
        }

        await migrationService.migrateAll();

        console.log('\n═══════════════════════════════════════');
        console.log('  Migration completed successfully! 🎉');
        console.log('═══════════════════════════════════════\n');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

bootstrap();
