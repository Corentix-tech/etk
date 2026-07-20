"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
// Authentication Endpoints (Brute force protected via rate limiting)
router.post('/register', rateLimiter_middleware_1.authRateLimiter, (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), controller.register);
router.post('/login', rateLimiter_middleware_1.authRateLimiter, (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), controller.login);
router.post('/logout', controller.logout);
// Protected Client Profile & Address Registry Routes
router.get('/profile', auth_middleware_1.authMiddleware, controller.getProfile);
router.post('/addresses', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(auth_validator_1.addressSchema), controller.addAddress);
router.delete('/addresses/:addressId', auth_middleware_1.authMiddleware, controller.deleteAddress);
exports.default = router;
