"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Schema for client registration
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string({
            message: 'Firebase ID Token is required',
        }).min(1, 'Firebase ID Token cannot be empty'),
        name: zod_1.z.string({
            message: 'Name is required',
        }).min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name cannot exceed 100 characters'),
        phone: zod_1.z.string({
            message: 'Phone number is required',
        }).regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number format (e.g. +919876543210)'),
    }),
});
// Schema for user login
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string({
            message: 'Firebase ID Token is required',
        }).min(1, 'Firebase ID Token cannot be empty'),
    }),
});
// Schema for adding/modifying address books
exports.addressSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            message: 'Receiver name is required',
        }).min(2, 'Receiver name must be at least 2 characters long'),
        phone: zod_1.z.string({
            message: 'Phone number is required',
        }).min(10, 'Phone number must be at least 10 digits long'),
        addressLine1: zod_1.z.string({
            message: 'Address Line 1 is required',
        }).min(5, 'Address Line 1 must be at least 5 characters long'),
        addressLine2: zod_1.z.string().optional().nullable(),
        city: zod_1.z.string({
            message: 'City is required',
        }).min(2, 'City must be at least 2 characters long'),
        state: zod_1.z.string({
            message: 'State is required',
        }).min(2, 'State must be at least 2 characters long'),
        postalCode: zod_1.z.string({
            message: 'Postal ZIP Code is required',
        }).min(5, 'Postal code must be at least 5 digits long')
            .max(10, 'Postal code cannot exceed 10 characters'),
        country: zod_1.z.string().default('India'),
    }),
});
exports.default = {
    registerSchema: exports.registerSchema,
    loginSchema: exports.loginSchema,
    addressSchema: exports.addressSchema,
};
