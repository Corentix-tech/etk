"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customisation_controller_1 = require("../controllers/customisation.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const customisation_validator_1 = require("../validators/customisation.validator");
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});
const router = (0, express_1.Router)();
const controller = new customisation_controller_1.CustomisationController();
// Customer Request Endpoints (Protected by Authentication checking)
router.post('/', auth_middleware_1.authMiddleware, upload.array('images', 5), (0, validate_middleware_1.validate)(customisation_validator_1.createCustomisationSchema), controller.create);
router.put('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(customisation_validator_1.updateCustomisationSchema), controller.update);
router.get('/', auth_middleware_1.authMiddleware, controller.list);
router.get('/:id', auth_middleware_1.authMiddleware, controller.getById);
// Admin Stylist Panel Endpoints (Protected by Admin authorization checking)
router.post('/:id/notes', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(customisation_validator_1.addNoteSchema), controller.addNote);
router.put('/:id/status', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, (0, validate_middleware_1.validate)(customisation_validator_1.updateCustomisationStatusSchema), controller.updateStatus);
exports.default = router;
