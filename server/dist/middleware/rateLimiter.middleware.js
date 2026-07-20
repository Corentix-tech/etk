"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.apiRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Standard rate limiter for general application API routes
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.',
        errors: ['Rate Limit Exceeded'],
    },
});
// Stricter rate limiter for authentication/login/register credentials endpoints
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 15, // Limit each IP to 15 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        errors: ['Brute Force Prevention Limit Exceeded'],
    },
});
exports.default = exports.apiRateLimiter;
