import {Sequelize} from 'sequelize';
import {createLogger} from '../utils/logger';
import {config} from '../config/environment';

const logger = createLogger('database');

// Sequelize instance
export const sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.db.host,
    port: Number(config.db.port),
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,

    // SQL logging in development only
    logging:
        config.nodeEnv === 'development' ?
            (sql) => logger.debug('SQL', {sql}) : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

// Initialize database connection
export async function initDatabase(): Promise<void> {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established');
    } catch (error) {
        logger.error('Unable to connect to database', error);
        throw error;
    }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
    try {
        await sequelize.close();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error closing database', error);
        throw error;
    }
}