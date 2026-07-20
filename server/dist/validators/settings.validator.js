"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = void 0;
const zod_1 = require("zod");
// Helper to preprocess and parse potential JSON strings sent via multipart/form-data
const jsonStringPreprocess = (fallbackSchema) => zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        }
        catch {
            return val;
        }
    }
    return val;
}, fallbackSchema);
// Schema for updating global store settings
exports.updateSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        heroBanners: jsonStringPreprocess(zod_1.z.array(zod_1.z.object({
            imageUrl: zod_1.z.string({
                message: 'Image URL is required',
            }).url('Must be a valid URL'),
            title: zod_1.z.string({
                message: 'Banner title is required',
            }).min(1, 'Title cannot be empty'),
            subtitle: zod_1.z.string({
                message: 'Banner subtitle is required',
            }).min(1, 'Subtitle cannot be empty'),
            link: zod_1.z.string({
                message: 'Banner redirect link is required',
            }).min(1, 'Link cannot be empty'),
        }))).optional(),
        whatsappNumber: zod_1.z.string().min(10, 'WhatsApp number must be at least 10 digits long').optional(),
        storeHours: zod_1.z.string().min(1, 'Store hours cannot be empty').optional(),
        shippingRates: jsonStringPreprocess(zod_1.z.array(zod_1.z.object({
            pincodeRange: zod_1.z.string({
                message: 'Pincode range definition is required',
            }).min(1, 'Pincode range cannot be empty'),
            rate: zod_1.z.preprocess((val) => {
                if (typeof val === 'string') {
                    const parsed = parseInt(val, 10);
                    return isNaN(parsed) ? val : parsed;
                }
                return val;
            }, zod_1.z.number().int().min(0, 'Shipping rate cannot be negative')),
        }))).optional(),
    }),
});
exports.default = {
    updateSettingsSchema: exports.updateSettingsSchema,
};
