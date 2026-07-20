"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const order_repository_1 = require("../repositories/order.repository");
const product_service_1 = require("./product.service");
const pagination_1 = require("../utils/pagination");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
class OrderService {
    orderRepository = new order_repository_1.OrderRepository();
    productService = new product_service_1.ProductService();
    razorpayClient = null;
    constructor() {
        if (env_1.env.RAZORPAY_KEY_ID && env_1.env.RAZORPAY_KEY_SECRET) {
            this.razorpayClient = new razorpay_1.default({
                key_id: env_1.env.RAZORPAY_KEY_ID,
                key_secret: env_1.env.RAZORPAY_KEY_SECRET,
            });
        }
        else {
            logger_1.logger.warn('⚠️ Warning: Razorpay API keys are missing. Payment Sandbox bypass will be active.');
        }
    }
    /**
     * Calculates order fees and creates a pending checkout order.
     */
    async createOrder(userId, customerDetails, itemsInput, shippingAddress) {
        try {
            let subtotal = 0;
            const orderItems = [];
            // 1. Validate product inventory and accumulate subtotal
            for (const item of itemsInput) {
                const product = await this.productService.getProductById(item.productId);
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found.`);
                }
                // Check if size exists and is in stock
                const availableStock = product.sizes[item.size] || 0;
                if (availableStock < item.quantity) {
                    throw new Error(`Insufficient stock for product "${product.name}" in size ${item.size}. Available: ${availableStock}`);
                }
                const price = product.discountPrice || product.price;
                subtotal += price * item.quantity;
                orderItems.push({
                    id: crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : Math.random().toString(36).substring(2, 9),
                    productId: item.productId,
                    name: product.name,
                    sku: product.sku,
                    size: item.size,
                    quantity: item.quantity,
                    price,
                    color: item.color,
                    image: product.images[0] || '',
                });
            }
            // 2. Calculate tax (12% GST) & Shipping (Free over ₹10k, else ₹150)
            const gst = Math.round(subtotal * 0.12);
            const tenThousandRupeesInPaise = 1000000;
            const shipping = subtotal >= tenThousandRupeesInPaise ? 0 : 15000; // 15000 Paise = ₹150
            const total = subtotal + gst + shipping;
            // 3. Initiate payment gateway registration
            let razorpayOrderId = null;
            let paymentMethod = 'sandbox';
            if (this.razorpayClient) {
                const option = {
                    amount: total,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                };
                const rpOrder = await this.razorpayClient.orders.create(option);
                razorpayOrderId = rpOrder.id;
                paymentMethod = 'razorpay';
            }
            else {
                // Fallback to Sandbox ID
                razorpayOrderId = `order_sandbox_${Math.random().toString(36).substring(2, 12)}`;
                paymentMethod = 'sandbox';
            }
            const pendingOrder = {
                userId,
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone,
                customerEmail: customerDetails.email,
                items: orderItems,
                subtotal,
                gst,
                shipping,
                total,
                razorpayOrderId,
                razorpayPaymentId: null,
                razorpaySignature: null,
                paymentMethod,
                paymentStatus: 'pending',
                orderStatus: 'NEW',
                shippingAddress,
                trackingNumber: null,
                createdAt: new Date().toISOString(),
                statusHistory: [
                    {
                        status: 'NEW',
                        timestamp: new Date().toISOString(),
                        note: `Order initialized. Payment method: ${paymentMethod}.`,
                    },
                ],
            };
            const createdOrder = await this.orderRepository.create(pendingOrder);
            logger_1.logger.info(`📦 Order created: ${createdOrder.id} - Pending payment.`);
            return createdOrder;
        }
        catch (error) {
            logger_1.logger.error('Error in OrderService createOrder:', error);
            throw error;
        }
    }
    /**
     * Verifies the Razorpay payment signature, confirms the order, and updates product inventory.
     */
    async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        try {
            const order = await this.orderRepository.findByRazorpayOrderId(razorpayOrderId);
            if (!order || !order.id) {
                throw new Error(`Order with payment ID ${razorpayOrderId} not found.`);
            }
            if (order.paymentStatus === 'paid') {
                return order;
            }
            // 1. Signature Authentication
            if (order.paymentMethod === 'sandbox') {
                // Sandbox signature bypass verification rules
                if (razorpaySignature !== 'sandbox_signature' && !razorpayOrderId.startsWith('order_sandbox_')) {
                    throw new Error('Sandbox payment verification failed. Invalid payload signature.');
                }
                logger_1.logger.info(`💳 Sandbox bypass confirmed for order: ${order.id}`);
            }
            else {
                // Verify genuine Razorpay signature HMAC
                const hmac = crypto_1.default.createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET || '');
                hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
                const generatedSignature = hmac.digest('hex');
                if (generatedSignature !== razorpaySignature) {
                    throw new Error('Razorpay verification failed. Signature mismatch.');
                }
            }
            // 2. Allocate inventory (deduct sizes stock count)
            for (const item of order.items) {
                await this.productService.updateStock(item.productId, item.size, item.quantity);
            }
            // 3. Mark transaction paid and transition order status to CONFIRMED
            const now = new Date().toISOString();
            const updatedHistory = [
                ...order.statusHistory,
                {
                    status: 'CONFIRMED',
                    timestamp: now,
                    note: `Payment verified. Transaction ID: ${razorpayPaymentId}`,
                },
            ];
            const updatedOrder = await this.orderRepository.update(order.id, {
                paymentStatus: 'paid',
                orderStatus: 'CONFIRMED',
                razorpayPaymentId,
                razorpaySignature,
                statusHistory: updatedHistory,
            });
            if (!updatedOrder) {
                throw new Error('Failed to update order status during checkout confirmation.');
            }
            logger_1.logger.info(`💳 Order ${order.id} payment verified. Inventory allocated.`);
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error('Error in OrderService verifyPayment:', error);
            throw error;
        }
    }
    /**
     * Modifies an order's status pipeline (Admin only).
     */
    async updateStatus(orderId, status, note) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }
        const updatedHistory = [
            ...order.statusHistory,
            {
                status,
                timestamp: new Date().toISOString(),
                note,
            },
        ];
        return this.orderRepository.update(orderId, {
            orderStatus: status,
            statusHistory: updatedHistory,
        });
    }
    /**
     * Assigns a shipping carrier tracking airway bill number (Admin only).
     */
    async addTrackingNumber(orderId, trackingNumber) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }
        const updatedHistory = [
            ...order.statusHistory,
            {
                status: 'SHIPPED',
                timestamp: new Date().toISOString(),
                note: `Shipping tracking number assigned: ${trackingNumber}`,
            },
        ];
        return this.orderRepository.update(orderId, {
            trackingNumber,
            orderStatus: 'SHIPPED',
            statusHistory: updatedHistory,
        });
    }
    /**
     * Retrieves a printable HTML/JSON invoice format for the order.
     */
    async generateInvoice(orderId) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }
        return {
            invoiceNumber: `INV-2026-${order.id?.substring(0, 8).toUpperCase()}`,
            issueDate: order.createdAt,
            company: {
                name: 'ETNIKO Atelier',
                address: '12-C, Heritage Lane, Colaba, Mumbai, MH, 400001, India',
                phone: '+91 22 8765 4321',
                gstin: '27AAAAA1111A1Z1',
            },
            order,
        };
    }
    /**
     * Lists orders matching filters.
     */
    async listOrders(filters, page = 1, limit = 10) {
        const { items, total } = await this.orderRepository.list(filters, { page, limit });
        const pagination = (0, pagination_1.getPaginationMetadata)(total, page, limit);
        return { items, pagination };
    }
    /**
     * Lists all transactions completed or drafts belonging to a specific client profile.
     */
    async getClientOrders(userId) {
        return this.orderRepository.findByUserId(userId);
    }
    /**
     * Retrieves details for a specific order.
     */
    async getOrderById(orderId) {
        return this.orderRepository.findById(orderId);
    }
}
exports.OrderService = OrderService;
exports.default = OrderService;
