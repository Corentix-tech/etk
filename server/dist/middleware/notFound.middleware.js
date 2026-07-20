"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        errors: ['Not Found'],
    });
};
exports.notFoundMiddleware = notFoundMiddleware;
exports.default = exports.notFoundMiddleware;
