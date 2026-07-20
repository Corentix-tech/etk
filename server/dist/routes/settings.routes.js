"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const settings_validator_1 = require("../validators/settings.validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure uploads folder exists
const uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({
    dest: uploadDir,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit for banner images
});
const router = (0, express_1.Router)();
const controller = new settings_controller_1.SettingsController();
// Public Configurations Endpoints
router.get('/', controller.get);
// Admin Configuration Endpoints (Protected by role verification checks)
router.put('/', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(settings_validator_1.updateSettingsSchema), controller.update);
router.post('/banner', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload.single('image'), controller.uploadBanner);
exports.default = router;
