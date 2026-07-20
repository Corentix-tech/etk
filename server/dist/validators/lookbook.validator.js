"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLookbookSchema = exports.createLookbookSchema = void 0;
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
// Schema for lookbook coordinate hotspot tags
const tagSchema = zod_1.z.object({
    productId: zod_1.z.string({
        message: 'Tagged Product ID is required',
    }).min(1, 'Product ID cannot be empty'),
    x: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? val : parsed;
        }
        return val;
    }, zod_1.z.number().min(0, 'X percentage coordinate offset cannot be less than 0').max(100, 'X coordinate offset cannot exceed 100')),
    y: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? val : parsed;
        }
        return val;
    }, zod_1.z.number().min(0, 'Y percentage coordinate offset cannot be less than 0').max(100, 'Y coordinate offset cannot exceed 100')),
    timestamp: zod_1.z.string().optional().nullable(),
});
exports.createLookbookSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({
            message: 'Lookbook title is required',
        }).min(2, 'Lookbook title must be at least 2 characters long'),
        tags: jsonStringPreprocess(zod_1.z.array(tagSchema).default([])),
    }),
});
exports.updateLookbookSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2).optional(),
        tags: jsonStringPreprocess(zod_1.z.array(tagSchema)).optional(),
    }),
});
exports.default = {
    createLookbookSchema: exports.createLookbookSchema,
    updateLookbookSchema: exports.updateLookbookSchema,
};
