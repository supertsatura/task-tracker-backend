type LogLevel = 'INFO' | 'ERROR' | 'DEBUG';

export interface Logger {
    info(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
    debug(message: string, meta?: unknown): void;
}

export function createLogger(context = 'app'): Logger {

    const format = (
        level: LogLevel,
        message: string,
        meta?: unknown
    ) => {
        const time = new Date().toISOString();

        console.log(
            `[${time}] [${context}] [${level}]`,
            message,
            meta ?? ''
        );
    };

    return {
        info: (msg, meta) => format('INFO', msg, meta),
        error: (msg, meta) => format('ERROR', msg, meta),
        debug: (msg, meta) => format('DEBUG', msg, meta),
    };
}