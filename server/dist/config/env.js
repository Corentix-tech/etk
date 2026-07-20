"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000').transform((val) => parseInt(val, 10)),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: zod_1.z.string().url().default('http://localhost:5173'),
    JWT_SECRET: zod_1.z.string().min(8, 'JWT_SECRET must be at least 8 characters long').default('your_super_secret_key'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().default('placeholder'),
    CLOUDINARY_API_KEY: zod_1.z.string().default('placeholder'),
    CLOUDINARY_API_SECRET: zod_1.z.string().default('placeholder'),
    FIREBASE_PROJECT_ID: zod_1.z.string().default('placeholder'),
    FIREBASE_SERVICE_ACCOUNT_PATH: zod_1.z.string().default('credentials/firebase-service-account.json'),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
});
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables Configuration:');
        console.error(JSON.stringify(result.error.format(), null, 2));
        process.exit(1);
    }
    return result.data;
};
exports.env = parseEnv();
