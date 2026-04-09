import * as dotenv from 'dotenv';

dotenv.config();

export interface DBConfig {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
}

export interface AppConfig {
    nodeEnv: string;
    db: DBConfig;
}

export const config: AppConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'task_tracker',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '1234',
    }
};