"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomisationService = void 0;
const customisation_repository_1 = require("../repositories/customisation.repository");
const cloudinary_1 = require("../utils/cloudinary");
const pagination_1 = require("../utils/pagination");
const logger_1 = require("../config/logger");
class CustomisationService {
    customisationRepository = new customisation_repository_1.CustomisationRepository();
    /**
     * Submits a new tailored fashion request, uploading client-supplied sketches to Cloudinary.
     */
    async createRequest(requestData, localImagePaths) {
        try {
            // 1. Upload client design sketches to Cloudinary customisation-inspiration folder
            const imageUrls = [];
            for (const path of localImagePaths) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(path, 'customisation-inspiration');
                imageUrls.push(uploadResult.secureUrl);
            }
            const newRequest = {
                ...requestData,
                images: imageUrls,
                status: 'NEW',
                adminNotes: [],
            };
            const savedRequest = await this.customisationRepository.create(newRequest);
            logger_1.logger.info(`✂️ New tailoring request submitted by: ${savedRequest.email} (ID: ${savedRequest.id})`);
            return savedRequest;
        }
        catch (error) {
            logger_1.logger.error('Error in CustomisationService createRequest:', error);
            throw error;
        }
    }
    /**
     * Modifies tailoring fields or measurement logs of an existing custom request.
     */
    async updateRequest(id, data) {
        const existing = await this.customisationRepository.findById(id);
        if (!existing) {
            throw new Error(`Customisation request with ID ${id} not found.`);
        }
        return this.customisationRepository.update(id, data);
    }
    /**
     * Appends an administrative note or stylist consultation logs to the request dossier.
     */
    async addAdminNote(id, author, text) {
        const request = await this.customisationRepository.findById(id);
        if (!request) {
            throw new Error(`Customisation request with ID ${id} not found.`);
        }
        const newNote = {
            author,
            text,
            timestamp: new Date().toISOString(),
        };
        const updatedNotes = [...(request.adminNotes || []), newNote];
        return this.customisationRepository.update(id, { adminNotes: updatedNotes });
    }
    /**
     * Transitions the status state of the request (e.g. from DISCUSSION to PRODUCTION).
     */
    async updateStatus(id, status) {
        const request = await this.customisationRepository.findById(id);
        if (!request) {
            throw new Error(`Customisation request with ID ${id} not found.`);
        }
        logger_1.logger.info(`✂️ Transitioning custom request ${id} status: ${request.status} ➔ ${status}`);
        return this.customisationRepository.update(id, { status });
    }
    /**
     * Lists request dossiers matching filters with pagination data.
     */
    async listRequests(filters, page = 1, limit = 10) {
        const { items, total } = await this.customisationRepository.list(filters, { page, limit });
        const pagination = (0, pagination_1.getPaginationMetadata)(total, page, limit);
        return { items, pagination };
    }
    /**
     * Fetches a specific requests record by ID.
     */
    async getRequestById(id) {
        return this.customisationRepository.findById(id);
    }
    /**
     * Lists all requests made by a specific customer.
     */
    async getClientRequests(userId) {
        return this.customisationRepository.findByUserId(userId);
    }
}
exports.CustomisationService = CustomisationService;
exports.default = CustomisationService;
