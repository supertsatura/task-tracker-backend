import {initDatabase, closeDatabase, sequelize} from './db/database';
import './models/task.model';

async function createTable(): Promise<void> {
    await initDatabase();
    await sequelize.sync();
    console.log('Table tasks created');
}

(async () => {
    try {
        await createTable();
        await closeDatabase();
        process.exit(0);
    } catch (createError) {
        console.error('Table creation failed', createError);
        try {
            await closeDatabase();
        } catch (closeError) {
            console.error('Database closing failed', closeError);
        }
        process.exit(1);
    }
})()