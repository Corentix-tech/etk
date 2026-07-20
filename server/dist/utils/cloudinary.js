"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const cloudinary_1 = require("../config/cloudinary");
const logger_1 = require("../config/logger");
/**
 * Uploads a local file to Cloudinary and cleans up the temporary local file in the process.
 * @param localFilePath Path to the file stored temporarily on the server disk
 * @param folder Subfolder name inside the root 'etniko' directory (e.g. 'products', 'lookbook')
 */
const uploadToCloudinary = async (localFilePath, folder) => {
    try {
        const result = await cloudinary_1.cloudinary.uploader.upload(localFilePath, {
            folder: `etniko/${folder}`,
            resource_type: 'auto', // Automatically detect image or video formats
        });
        return {
            publicId: result.public_id,
            secureUrl: result.secure_url,
        };
    }
    catch (error) {
        logger_1.logger.error(`Cloudinary upload failed for file: ${localFilePath}`, error);
        throw error;
    }
    finally {
        // Delete the temporary file from local storage to keep disk space free
        try {
            await promises_1.default.unlink(localFilePath);
        }
        catch (unlinkError) {
            logger_1.logger.warn(`Failed to clean up temporary file: ${localFilePath}`, unlinkError);
        }
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Deletes an asset from Cloudinary using its public ID.
 * @param publicId Public ID of the asset stored in Cloudinary
 * @param isVideo Set to true if the asset is a video lookbook reel
 */
const deleteFromCloudinary = async (publicId, isVideo = false) => {
    try {
        const result = await cloudinary_1.cloudinary.uploader.destroy(publicId, {
            resource_type: isVideo ? 'video' : 'image',
        });
        return result.result === 'ok';
    }
    catch (error) {
        logger_1.logger.error(`Failed to delete Cloudinary asset with public ID: ${publicId}`, error);
        return false;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = {
    uploadToCloudinary: exports.uploadToCloudinary,
    deleteFromCloudinary: exports.deleteFromCloudinary,
};
