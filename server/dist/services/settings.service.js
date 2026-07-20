"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repository_1 = require("../repositories/settings.repository");
const cloudinary_1 = require("../utils/cloudinary");
const logger_1 = require("../config/logger");
class SettingsService {
    settingsRepository = new settings_repository_1.SettingsRepository();
    /**
     * Fetches the global settings. Returns default configurations if the database record is empty.
     */
    async getSettings() {
        const settings = await this.settingsRepository.get();
        if (settings) {
            return settings;
        }
        // Default configuration fallback
        const defaultSettings = {
            heroBanners: [
                {
                    imageUrl: 'https://images.unsplash.com/photo-1610030470298-4c5855797ee3?auto=format&fit=crop&w=1200&q=80',
                    title: 'Timeless Heritage Weaves',
                    subtitle: 'Pure Banarasi Chanderi Silks & Zari Couture',
                    link: '/shop?category=WOMEN',
                },
            ],
            whatsappNumber: '+919876543210',
            storeHours: 'Monday - Saturday: 11:00 AM - 8:00 PM IST',
            shippingRates: [
                {
                    pincodeRange: 'default',
                    rate: 15000, // ₹150 in Paise
                },
            ],
        };
        logger_1.logger.info('⚙️ Initializing default settings template on first fetch.');
        return this.settingsRepository.update(defaultSettings);
    }
    /**
     * Modifies the global settings parameters.
     * @param data Partial settings specifications
     */
    async updateSettings(data) {
        logger_1.logger.info('⚙️ Updating global settings configurations.');
        return this.settingsRepository.update(data);
    }
    /**
     * Uploads a promotional banner graphic directly to Cloudinary's settings repository.
     * @param localFilePath Path to the file stored temporarily on the server disk
     */
    async uploadBannerImage(localFilePath) {
        try {
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(localFilePath, 'settings');
            return uploadResult.secureUrl;
        }
        catch (error) {
            logger_1.logger.error('Failed to upload hero banner image:', error);
            throw error;
        }
    }
}
exports.SettingsService = SettingsService;
exports.default = SettingsService;
