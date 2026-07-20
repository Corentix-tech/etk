"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const controller = new dashboard_controller_1.DashboardController();
// Analytics overview endpoint (Strictly Admin only)
router.get('/analytics', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, controller.getAnalytics);
exports.default = router;
