import winston from "winston";
import path from "path";
import { envs } from "./index";

// Definir niveles de log personalizados
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const logColors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

// Agregar colores a winston
winston.addColors(logColors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Crear directorio de logs si no existe
const logDir = path.join(process.cwd(), "logs");

// Configuración de transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: logFormat,
    }),

    // File transport para errores
    new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
    }),

    // File transport para todos los logs
    new winston.transports.File({
        filename: path.join(logDir, "combined.log"),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
    }),
];

// Crear logger
const logger = winston.createLogger({
    level: envs.NODE_ENV === "development" ? "debug" : "warn",
    levels: logLevels,
    format: logFormat,
    transports,
    exitOnError: false,
});

export { logger };
