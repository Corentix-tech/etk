"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const settings_service_1 = require("../services/settings.service");
const response_1 = require("../utils/response");
class SettingsController {
    settingsService = new settings_service_1.SettingsService();
    /**
     * Fetches the global settings.
     */
    get = async (req, res, next) => {
        try {
            const settings = await this.settingsService.getSettings();
            (0, response_1.sendSuccess)(res, { settings }, 'Global configurations retrieved.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Modifies the global settings (Admin only).
     */
    update = async (req, res, next) => {
        try {
            const { heroBanners, whatsappNumber, storeHours, shippingRates } = req.body;
            const parsedBanners = typeof heroBanners === 'string' ? JSON.parse(heroBanners) : heroBanners;
            const parsedRates = typeof shippingRates === 'string' ? JSON.parse(shippingRates) : shippingRates;
            const updated = await this.settingsService.updateSettings({
                ...(parsedBanners && { heroBanners: parsedBanners }),
                ...(whatsappNumber && { whatsappNumber }),
                ...(storeHours && { storeHours }),
                ...(parsedRates && { shippingRates: parsedRates }),
            });
            (0, response_1.sendSuccess)(res, { settings: updated }, 'Store settings updated successfully.', 200);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Uploads a promotional banner graphic (Admin only).
     */
    uploadBanner = async (req, res, next) => {
        try {
            const localFilePath = req.file?.path;
            if (!localFilePath) {
                res.status(400).json({
                    success: false,
                    message: 'Image file is required.',
                    errors: ['image is required'],
                });
                return;
            }
            const imageUrl = await this.settingsService.uploadBannerImage(localFilePath);
            (0, response_1.sendSuccess)(res, { imageUrl }, 'Hero banner graphic uploaded successfully.', 201);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.SettingsController = SettingsController;
exports.default = SettingsController;
