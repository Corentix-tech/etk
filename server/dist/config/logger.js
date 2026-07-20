"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./env");
// Ensure the logs directory exists
const logDirectory = path_1.default.resolve(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory, { recursive: true });
}
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    return env_1.env.NODE_ENV === 'development' ? 'debug' : 'info';
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), // Include stack trace on errors
winston_1.default.format.splat(), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`));
const transports = [
    // Output logs to console
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
    // Output error logs to error.log
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDirectory, 'error.log'),
        level: 'error',
    }),
    // Output all logs to combined.log
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDirectory, 'combined.log'),
    }),
];
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exitOnError: false, // Do not exit on handled exceptions
});
exports.default = exports.logger;
