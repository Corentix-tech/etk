"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lookbook_controller_1 = require("../controllers/lookbook.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const lookbook_validator_1 = require("../validators/lookbook.validator");
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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit for lookbook videos
});
const router = (0, express_1.Router)();
const controller = new lookbook_controller_1.LookbookController();
// Public Snaps Feed Queries
router.get('/', controller.list);
router.get('/:id', controller.getById);
// Administrative Content Management Endpoints
router.post('/', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]), (0, validate_middleware_1.validate)(lookbook_validator_1.createLookbookSchema), controller.create);
router.put('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]), (0, validate_middleware_1.validate)(lookbook_validator_1.updateLookbookSchema), controller.update);
router.delete('/:id', auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, controller.delete);
exports.default = router;
