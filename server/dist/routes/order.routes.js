"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
const controller = new order_controller_1.OrderController();
// Customer Order Endpoints (Protected by Auth middleware)
router.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(order_validator_1.createOrderSchema), controller.create);
router.post('/verify', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(order_validator_1.verifyPaymentSchema), controller.verifyPayment);
router.get('/', auth_middleware_1.authMiddleware, controller.list);
router.get('/:id', auth_middleware_1.authMiddleware, controller.getById);
router.get('/:id/invoice', auth_middleware_1.authMiddleware, controller.getInvoice);
// Admin Fulfillment Endpoints (Protected by Admin authorization checks)
router.put('/:id/status', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(order_validator_1.updateStatusSchema), controller.updateStatus);
router.put('/:id/tracking', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(order_validator_1.addTrackingSchema), controller.addTracking);
exports.default = router;
