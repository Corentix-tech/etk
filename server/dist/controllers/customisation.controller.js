"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomisationController = void 0;
const customisation_service_1 = require("../services/customisation.service");
const response_1 = require("../utils/response");
class CustomisationController {
    customisationService = new customisation_service_1.CustomisationService();
    /**
     * Submits a new tailoring design request.
     */
    create = async (req, res, next) => {
        try {
            const userId = req.user ? req.user.uid : null;
            const { customerName, phone, email, whatsappNumber, category, occasion, fabricPref, colorPref, budgetRange, deliveryDate, notes, } = req.body;
            const files = req.files || [];
            const localImagePaths = files.map((file) => file.path);
            const request = await this.customisationService.createRequest({
                userId,
                customerName: customerName || req.user?.name || 'Client',
                phone,
                email: email || req.user?.email || '',
                whatsappNumber: whatsappNumber || null,
                category,
                occasion,
                fabricPref: fabricPref || null,
                colorPref: colorPref || null,
                budgetRange: budgetRange || null,
                deliveryDate: deliveryDate || null,
                notes: notes || null,
            }, localImagePaths);
            (0, response_1.sendSuccess)(res, { request }, 'Tailoring request submitted successfully.', 201);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Modifies tailoring fields or measurement logs of an existing custom request.
     */
    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { notes, fabricPref, colorPref, budgetRange, deliveryDate } = req.body;
            // Verify request exists and validate ownership credentials
            const request = await this.customisationService.getRequestById(id);
            if (!request) {
                res.status(404).json({ success: false, message: 'Request not found', errors: ['Not Found'] });
                return;
            }
            if (request.userId !== req.user.uid && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Access denied.', errors: ['Forbidden'] });
                return;
            }
            const updated = await this.customisationService.updateRequest(id, {
                ...(notes && { notes }),
                ...(fabricPref && { fabricPref }),
                ...(colorPref && { colorPref }),
                ...(budgetRange && { budgetRange }),
                ...(deliveryDate && { deliveryDate }),
            });
            (0, response_1.sendSuccess)(res, { request: updated }, 'Custom request updated successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Appends an administrative note or stylist consultation logs (Admin only).
     */
    addNote = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { text } = req.body;
            const author = req.user.name || req.user.email || 'Stylist';
            const request = await this.customisationService.addAdminNote(id, author, text);
            (0, response_1.sendSuccess)(res, { request }, 'Admin note appended successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Transitions the status state of the request (Admin only).
     */
    updateStatus = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const request = await this.customisationService.updateStatus(id, status);
            (0, response_1.sendSuccess)(res, { request }, 'Status updated successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Fetches details of a specific request.
     */
    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const request = await this.customisationService.getRequestById(id);
            if (!request) {
                res.status(404).json({ success: false, message: 'Request not found', errors: ['Not Found'] });
                return;
            }
            // Enforce customisation request ownership checks
            if (request.userId !== req.user.uid && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Access denied.', errors: ['Forbidden'] });
                return;
            }
            (0, response_1.sendSuccess)(res, { request }, 'Custom request details retrieved.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Lists request dossiers. Clients can only see their own requests; admins can see all database items.
     */
    list = async (req, res, next) => {
        try {
            const { page, limit, status } = req.query;
            const pageNum = page ? parseInt(page, 10) : 1;
            const limitNum = limit ? parseInt(limit, 10) : 10;
            const filters = {
                ...(status && { status }),
            };
            // Restrict clients to only viewing their own tailoring histories
            if (req.user.role !== 'ADMIN') {
                filters.userId = req.user.uid;
            }
            const result = await this.customisationService.listRequests(filters, pageNum, limitNum);
            (0, response_1.sendSuccess)(res, result, 'Customisation requests retrieved.', 200);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CustomisationController = CustomisationController;
exports.default = CustomisationController;
