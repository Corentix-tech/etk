"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomisationStatusSchema = exports.addNoteSchema = exports.updateCustomisationSchema = exports.createCustomisationSchema = void 0;
const zod_1 = require("zod");
// Schema for client customisation request creation
exports.createCustomisationSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerName: zod_1.z.string().min(2, 'Name must be at least 2 characters long').optional(),
        phone: zod_1.z.string({
            message: 'Contact phone number is required',
        }).min(10, 'Phone number must be at least 10 digits long'),
        email: zod_1.z.string().email('Please provide a valid contact email').optional(),
        whatsappNumber: zod_1.z.string().optional().nullable(),
        category: zod_1.z.string({
            message: 'Garment category is required',
        }).min(1, 'Category cannot be empty'),
        occasion: zod_1.z.string({
            message: 'Occasion details are required',
        }).min(1, 'Occasion cannot be empty'),
        fabricPref: zod_1.z.string().optional().nullable(),
        colorPref: zod_1.z.string().optional().nullable(),
        budgetRange: zod_1.z.string().optional().nullable(),
        deliveryDate: zod_1.z.string().optional().nullable(),
        notes: zod_1.z.string().optional().nullable(), // Stores measurement details and styling notes
    }),
});
// Schema for updating tailoring request details
exports.updateCustomisationSchema = zod_1.z.object({
    body: zod_1.z.object({
        notes: zod_1.z.string().optional(),
        fabricPref: zod_1.z.string().optional().nullable(),
        colorPref: zod_1.z.string().optional().nullable(),
        budgetRange: zod_1.z.string().optional().nullable(),
        deliveryDate: zod_1.z.string().optional().nullable(),
    }),
});
// Schema for appending stylist notes
exports.addNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        text: zod_1.z.string({
            message: 'Note content is required',
        }).min(1, 'Note content cannot be empty'),
    }),
});
// Schema for transitioning status
exports.updateCustomisationStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['NEW', 'IN_DISCUSSION', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED'], {
            message: 'Invalid status value. Must match the customisation status workflow.',
        }),
    }),
});
exports.default = {
    createCustomisationSchema: exports.createCustomisationSchema,
    updateCustomisationSchema: exports.updateCustomisationSchema,
    addNoteSchema: exports.addNoteSchema,
    updateCustomisationStatusSchema: exports.updateCustomisationStatusSchema,
};
