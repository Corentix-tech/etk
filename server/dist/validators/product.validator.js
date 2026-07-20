"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
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
// Helper to preprocess and coerce strings to integers (e.g. price fields)
const numberPreprocess = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? val : parsed;
    }
    return val;
}, zod_1.z.number().int().min(0, 'Value must be a positive integer'));
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            message: 'Product name is required',
        }).min(2, 'Product name must be at least 2 characters long'),
        category: zod_1.z.enum(['WOMEN', 'MEN', 'KIDS'], {
            message: 'Category must be WOMEN, MEN, or KIDS',
        }),
        subcategory: zod_1.z.string({
            message: 'Subcategory is required',
        }).min(1, 'Subcategory cannot be empty'),
        price: numberPreprocess,
        discountPrice: zod_1.z.preprocess((val) => {
            if (val === '' || val === 'null' || val === undefined)
                return null;
            if (typeof val === 'string') {
                const parsed = parseInt(val, 10);
                return isNaN(parsed) ? val : parsed;
            }
            return val;
        }, zod_1.z.number().int().min(0).nullable().optional()),
        description: zod_1.z.string({
            message: 'Description is required',
        }).min(5, 'Description must be at least 5 characters long'),
        story: zod_1.z.string().optional().nullable(),
        fabric: zod_1.z.string({
            message: 'Fabric details are required',
        }).min(2, 'Fabric details must specify the weave'),
        colors: jsonStringPreprocess(zod_1.z.array(zod_1.z.string()).min(1, 'At least one color swatch is required')),
        sizes: jsonStringPreprocess(zod_1.z.record(zod_1.z.string(), zod_1.z.number().int().min(0, 'Inventory stock cannot be negative'))),
        type: zod_1.z.enum(['READY_TO_WEAR', 'CUSTOM_MADE'], {
            message: 'Garment type must be READY_TO_WEAR or CUSTOM_MADE',
        }),
        status: zod_1.z.enum(['PUBLISHED', 'DRAFT']).default('DRAFT'),
        care: zod_1.z.string().optional().nullable(),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        category: zod_1.z.enum(['WOMEN', 'MEN', 'KIDS']).optional(),
        subcategory: zod_1.z.string().min(1).optional(),
        price: numberPreprocess.optional(),
        discountPrice: zod_1.z.preprocess((val) => {
            if (val === '' || val === 'null' || val === undefined)
                return null;
            if (typeof val === 'string') {
                const parsed = parseInt(val, 10);
                return isNaN(parsed) ? val : parsed;
            }
            return val;
        }, zod_1.z.number().int().min(0).nullable().optional()),
        description: zod_1.z.string().min(5).optional(),
        story: zod_1.z.string().optional().nullable(),
        fabric: zod_1.z.string().min(2).optional(),
        colors: jsonStringPreprocess(zod_1.z.array(zod_1.z.string()).min(1)).optional(),
        sizes: jsonStringPreprocess(zod_1.z.record(zod_1.z.string(), zod_1.z.number().int().min(0))).optional(),
        type: zod_1.z.enum(['READY_TO_WEAR', 'CUSTOM_MADE']).optional(),
        status: zod_1.z.enum(['PUBLISHED', 'DRAFT']).optional(),
        care: zod_1.z.string().optional().nullable(),
    }),
});
exports.default = {
    createProductSchema: exports.createProductSchema,
    updateProductSchema: exports.updateProductSchema,
};
