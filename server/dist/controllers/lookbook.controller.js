"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookbookController = void 0;
const lookbook_service_1 = require("../services/lookbook.service");
const response_1 = require("../utils/response");
class LookbookController {
    lookbookService = new lookbook_service_1.LookbookService();
    /**
     * Registers a new lookbook video reel (Admin only).
     */
    create = async (req, res, next) => {
        try {
            const { title, tags } = req.body;
            // Extract video and thumbnail streams populated by Multer's fields middleware
            const files = req.files;
            const localVideoPath = files?.video?.[0]?.path;
            const localThumbnailPath = files?.thumbnail?.[0]?.path;
            if (!localVideoPath) {
                res.status(400).json({
                    success: false,
                    message: 'Video file is required.',
                    errors: ['video is required'],
                });
                return;
            }
            // Parse tags sent as JSON strings from form-data clients
            const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            const look = await this.lookbookService.createLook({
                title,
                tags: parsedTags || [],
            }, localVideoPath, localThumbnailPath);
            (0, response_1.sendSuccess)(res, { look }, 'Lookbook video uploaded successfully.', 201);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Modifies lookbook details, coordinates, or product tags (Admin only).
     */
    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, tags } = req.body;
            const parsedFields = {};
            if (title)
                parsedFields.title = title;
            if (tags)
                parsedFields.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            const look = await this.lookbookService.updateLook(id, parsedFields);
            (0, response_1.sendSuccess)(res, { look }, 'Lookbook updated successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Removes a lookbook post (Admin only).
     */
    delete = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.lookbookService.deleteLook(id);
            (0, response_1.sendSuccess)(res, {}, 'Lookbook video deleted successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Retrieves detail logs for a specific lookbook.
     */
    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const look = await this.lookbookService.getLookById(id);
            if (!look) {
                res.status(404).json({ success: false, message: 'Lookbook video not found', errors: ['Not Found'] });
                return;
            }
            (0, response_1.sendSuccess)(res, { look }, 'Lookbook details retrieved.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Lists lookbook videography feeds.
     */
    list = async (req, res, next) => {
        try {
            const { page, limit } = req.query;
            const pageNum = page ? parseInt(page, 10) : 1;
            const limitNum = limit ? parseInt(limit, 10) : 10;
            const result = await this.lookbookService.listLooks(pageNum, limitNum);
            (0, response_1.sendSuccess)(res, result, 'Lookbook items retrieved successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.LookbookController = LookbookController;
exports.default = LookbookController;
