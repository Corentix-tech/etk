"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const product_validator_1 = require("../validators/product.validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure the local uploads directory exists
const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({
    dest: uploadDir,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});
const router = (0, express_1.Router)();
const controller = new product_controller_1.ProductController();
// Public Catalog Endpoints
router.get('/', controller.list);
router.get('/id/:id', controller.getById);
router.get('/slug/:slug', controller.getBySlug);
// Admin CRUD Inventory Endpoints (Chained with file upload parser and permissions check)
router.post('/', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload.array('images', 5), (0, validate_middleware_1.validate)(product_validator_1.createProductSchema), controller.create);
router.put('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload.array('images', 5), (0, validate_middleware_1.validate)(product_validator_1.updateProductSchema), controller.update);
router.delete('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, controller.delete);
exports.default = router;
