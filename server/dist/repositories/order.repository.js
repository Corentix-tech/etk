"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../utils/firebase");
class OrderRepository {
    static collectionName = 'orders';
    /**
     * Retrieves a single order document by ID.
     * @param id Firestore order document ID
     */
    async findById(id) {
        const doc = await firebase_1.db.collection(OrderRepository.collectionName).doc(id).get();
        return (0, firebase_2.mapDoc)(doc);
    }
    /**
     * Finds an order by its Razorpay transaction order ID.
     * @param razorpayOrderId Razorpay Order ID
     */
    async findByRazorpayOrderId(razorpayOrderId) {
        const querySnapshot = await firebase_1.db
            .collection(OrderRepository.collectionName)
            .where('razorpayOrderId', '==', razorpayOrderId)
            .limit(1)
            .get();
        const results = (0, firebase_2.mapQuery)(querySnapshot);
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Registers a brand new client order document in Firestore.
     * @param order Order details
     */
    async create(order) {
        const docRef = firebase_1.db.collection(OrderRepository.collectionName).doc();
        const now = new Date().toISOString();
        const dataToSave = {
            ...order,
            createdAt: now,
            statusHistory: order.statusHistory || [
                {
                    status: 'NEW',
                    timestamp: now,
                    note: 'Order draft initialized.',
                },
            ],
        };
        await docRef.set(dataToSave);
        return { id: docRef.id, ...dataToSave };
    }
    /**
     * Updates an existing order's parameters (e.g. status histories, payment verification IDs).
     * @param id Order document ID
     * @param order Partial order parameters
     */
    async update(id, order) {
        const docRef = firebase_1.db.collection(OrderRepository.collectionName).doc(id);
        await docRef.update(order);
        return this.findById(id);
    }
    /**
     * Lists orders matching filters with page offsets.
     * @param filters Query filter keys
     * @param pagination Page index and limit
     */
    async list(filters, pagination) {
        let queryRef = firebase_1.db.collection(OrderRepository.collectionName);
        // Apply exact match filters
        if (filters.userId) {
            queryRef = queryRef.where('userId', '==', filters.userId);
        }
        if (filters.orderStatus) {
            queryRef = queryRef.where('orderStatus', '==', filters.orderStatus);
        }
        if (filters.paymentStatus) {
            queryRef = queryRef.where('paymentStatus', '==', filters.paymentStatus);
        }
        // Default sorting order by creation date (descending)
        queryRef = queryRef.orderBy('createdAt', 'desc');
        const snapshot = await queryRef.get();
        const orders = (0, firebase_2.mapQuery)(snapshot);
        const total = orders.length;
        const startIndex = (pagination.page - 1) * pagination.limit;
        const paginatedOrders = orders.slice(startIndex, startIndex + pagination.limit);
        return {
            items: paginatedOrders,
            total,
        };
    }
    /**
     * Lists all orders completed or drafts belonging to a specific client profile.
     * @param userId Client document ID
     */
    async findByUserId(userId) {
        const querySnapshot = await firebase_1.db
            .collection(OrderRepository.collectionName)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return (0, firebase_2.mapQuery)(querySnapshot);
    }
}
exports.OrderRepository = OrderRepository;
exports.default = OrderRepository;
