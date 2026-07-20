"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            message: 'Access Denied. Administrator privileges required.',
            errors: ['Forbidden'],
        });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
exports.default = exports.adminMiddleware;
