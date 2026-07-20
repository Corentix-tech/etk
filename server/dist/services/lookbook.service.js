"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookbookService = void 0;
const lookbook_repository_1 = require("../repositories/lookbook.repository");
const cloudinary_1 = require("../utils/cloudinary");
const pagination_1 = require("../utils/pagination");
const logger_1 = require("../config/logger");
class LookbookService {
    lookbookRepository = new lookbook_repository_1.LookbookRepository();
    /**
     * Registers a new lookbook video reel, uploading the media file to Cloudinary.
     */
    async createLook(lookData, localVideoPath, localThumbnailPath) {
        try {
            // 1. Upload video file to Cloudinary lookbook folder
            const videoResult = await (0, cloudinary_1.uploadToCloudinary)(localVideoPath, 'lookbook');
            // 2. Resolve thumbnail image URL
            let thumbnailUrl = '';
            if (localThumbnailPath) {
                const thumbResult = await (0, cloudinary_1.uploadToCloudinary)(localThumbnailPath, 'lookbook');
                thumbnailUrl = thumbResult.secureUrl;
            }
            else {
                // Fallback: Utilize Cloudinary's dynamic video-to-image transformation path (.jpg extension format)
                thumbnailUrl = videoResult.secureUrl.replace(/\.[^/.]+$/, '.jpg');
            }
            const newLook = {
                ...lookData,
                videoUrl: videoResult.secureUrl,
                thumbnailUrl,
            };
            const savedLook = await this.lookbookRepository.create(newLook);
            logger_1.logger.info(`🎬 Lookbook video registered: "${savedLook.title}" (ID: ${savedLook.id})`);
            return savedLook;
        }
        catch (error) {
            logger_1.logger.error('Error in LookbookService createLook:', error);
            throw error;
        }
    }
    /**
     * Modifies an existing lookbook video tags, coordinates, or title.
     */
    async updateLook(id, data) {
        const existing = await this.lookbookRepository.findById(id);
        if (!existing) {
            throw new Error(`Lookbook with ID ${id} not found.`);
        }
        return this.lookbookRepository.update(id, data);
    }
    /**
     * Removes a lookbook document and deletes its source video and thumbnail from Cloudinary.
     */
    async deleteLook(id) {
        try {
            const look = await this.lookbookRepository.findById(id);
            if (!look) {
                throw new Error(`Lookbook with ID ${id} not found.`);
            }
            // Purge video from Cloudinary
            const videoUrlParts = look.videoUrl.split('/');
            const videoFile = videoUrlParts[videoUrlParts.length - 1];
            const videoPublicId = `etniko/lookbook/${videoFile.split('.')[0]}`;
            await (0, cloudinary_1.deleteFromCloudinary)(videoPublicId, true);
            // Purge custom thumbnail if it exists and isn't just a transformed jpg path of the video
            if (look.thumbnailUrl && !look.thumbnailUrl.startsWith(look.videoUrl.replace(/\.[^/.]+$/, ''))) {
                const thumbUrlParts = look.thumbnailUrl.split('/');
                const thumbFile = thumbUrlParts[thumbUrlParts.length - 1];
                const thumbPublicId = `etniko/lookbook/${thumbFile.split('.')[0]}`;
                await (0, cloudinary_1.deleteFromCloudinary)(thumbPublicId);
            }
            await this.lookbookRepository.delete(id);
            logger_1.logger.info(`🎬 Deleted lookbook video document: "${look.title}" (ID: ${id})`);
        }
        catch (error) {
            logger_1.logger.error(`Error in LookbookService deleteLook for ID ${id}:`, error);
            throw error;
        }
    }
    /**
     * Lists lookbooks with pagination.
     */
    async listLooks(page = 1, limit = 10) {
        const { items, total } = await this.lookbookRepository.list({ page, limit });
        const pagination = (0, pagination_1.getPaginationMetadata)(total, page, limit);
        return { items, pagination };
    }
    /**
     * Fetches details of a specific lookbook.
     */
    async getLookById(id) {
        return this.lookbookRepository.findById(id);
    }
}
exports.LookbookService = LookbookService;
exports.default = LookbookService;
