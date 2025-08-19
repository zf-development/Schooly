// TODO: Logger custom
// - Configuration du logger
// - Niveaux de log (error, warn, info, debug)
// - Formatage des messages

// TODO: Importer une bibliothèque de logging
// import winston from 'winston';

// TODO: Configuration du logger
const loggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestamp: true
};

// TODO: Créer le logger
// const logger = winston.createLogger({
//     level: loggerConfig.level,
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json()
//     ),
//     transports: [
//         new winston.transports.Console(),
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' })
//     ]
// });

// TODO: Fonctions de logging
export const logError = (message: string, error?: any) => {
    // TODO: Logger les erreurs
    console.error(message, error);
};

export const logWarn = (message: string, data?: any) => {
    // TODO: Logger les avertissements
    console.warn(message, data);
};

export const logInfo = (message: string, data?: any) => {
    // TODO: Logger les informations
    console.info(message, data);
};

export const logDebug = (message: string, data?: any) => {
    // TODO: Logger les messages de debug
    console.debug(message, data);
};
