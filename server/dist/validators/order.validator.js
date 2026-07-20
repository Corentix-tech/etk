"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrackingSchema = exports.updateStatusSchema = exports.verifyPaymentSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
// Schema for initial checkout order creation
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string({
                message: 'Product ID is required',
            }).min(1, 'Product ID cannot be empty'),
            size: zod_1.z.string({
                message: 'Size code is required',
            }).min(1, 'Size code cannot be empty'),
            quantity: zod_1.z.number({
                message: 'Quantity is required',
            }).int().min(1, 'Quantity must be at least 1'),
            color: zod_1.z.string({
                message: 'Color description is required',
            }).min(1, 'Color cannot be empty'),
        })).min(1, 'An order must contain at least one item'),
        shippingAddress: zod_1.z.object({
            name: zod_1.z.string({
                message: 'Shipping receiver name is required',
            }).min(2, 'Name must be at least 2 characters long'),
            phone: zod_1.z.string({
                message: 'Shipping phone number is required',
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
        customerName: zod_1.z.string().optional(),
        customerPhone: zod_1.z.string().optional(),
        customerEmail: zod_1.z.string().email('Please provide a valid contact email').optional(),
    }),
});
// Schema for payment verification
exports.verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        razorpayOrderId: zod_1.z.string({
            message: 'Razorpay Order ID is required',
        }).min(1, 'Order ID cannot be empty'),
        razorpayPaymentId: zod_1.z.string({
            message: 'Razorpay Payment ID is required',
        }).min(1, 'Payment ID cannot be empty'),
        razorpaySignature: zod_1.z.string({
            message: 'Razorpay Signature hash is required',
        }).min(1, 'Signature cannot be empty'),
    }),
});
// Schema for order status updates
exports.updateStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['NEW', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
            message: 'Invalid order pipeline status value',
        }),
        note: zod_1.z.string().optional(),
    }),
});
// Schema for assigning airway tracking bill numbers
exports.addTrackingSchema = zod_1.z.object({
    body: zod_1.z.object({
        trackingNumber: zod_1.z.string({
            message: 'Tracking airway bill code is required',
        }).min(1, 'Tracking number cannot be empty'),
    }),
});
exports.default = {
    createOrderSchema: exports.createOrderSchema,
    verifyPaymentSchema: exports.verifyPaymentSchema,
    updateStatusSchema: exports.updateStatusSchema,
    addTrackingSchema: exports.addTrackingSchema,
};
