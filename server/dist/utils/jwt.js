"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Signs a payload to generate a JWT token.
 * @param payload Object containing properties to sign (e.g. { uid, email, role })
 * @param expiresIn Expiration duration (defaults to 7d)
 */
const generateToken = (payload, expiresIn = '7d') => {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: expiresIn,
    });
};
exports.generateToken = generateToken;
/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token JWT token string
 */
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
};
exports.verifyToken = verifyToken;
exports.default = {
    generateToken: exports.generateToken,
    verifyToken: exports.verifyToken,
};
