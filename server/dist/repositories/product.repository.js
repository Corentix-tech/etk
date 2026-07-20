"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../utils/firebase");
class ProductRepository {
    static collectionName = 'products';
    /**
     * Retrieves a product by its unique document ID.
     * @param id Firestore document ID
     */
    async findById(id) {
        const doc = await firebase_1.db.collection(ProductRepository.collectionName).doc(id).get();
        return (0, firebase_2.mapDoc)(doc);
    }
    /**
     * Retrieves a product by its unique URL slug.
     * @param slug Unique product slug string
     */
    async findBySlug(slug) {
        const querySnapshot = await firebase_1.db
            .collection(ProductRepository.collectionName)
            .where('slug', '==', slug.toLowerCase())
            .limit(1)
            .get();
        const results = (0, firebase_2.mapQuery)(querySnapshot);
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Resolves the next sequence number in the collection to pad SKUs correctly.
     */
    async getNextSequence() {
        const snapshot = await firebase_1.db.collection(ProductRepository.collectionName).select().get();
        return snapshot.size + 1;
    }
    /**
     * Creates a new product document.
     * @param product Product specifications
     */
    async create(product) {
        const docRef = firebase_1.db.collection(ProductRepository.collectionName).doc();
        const now = new Date().toISOString();
        const dataToSave = {
            ...product,
            createdAt: now,
            updatedAt: now,
        };
        await docRef.set(dataToSave);
        return { id: docRef.id, ...dataToSave };
    }
    /**
     * Updates an existing product document.
     * @param id Product document ID
     * @param product Partial product details
     */
    async update(id, product) {
        const docRef = firebase_1.db.collection(ProductRepository.collectionName).doc(id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...product,
            updatedAt: now,
        };
        await docRef.update(dataToUpdate);
        return this.findById(id);
    }
    /**
     * Deletes a product document.
     * @param id Product document ID
     */
    async delete(id) {
        await firebase_1.db.collection(ProductRepository.collectionName).doc(id).delete();
    }
    /**
     * Lists products matching filters and applies pagination offsets.
     * @param filters Query filter keys
     * @param pagination Page index and limit
     */
    async list(filters, pagination) {
        let queryRef = firebase_1.db.collection(ProductRepository.collectionName);
        // Apply exact match Firestore indexes filters
        if (filters.category) {
            queryRef = queryRef.where('category', '==', filters.category);
        }
        if (filters.subcategory) {
            queryRef = queryRef.where('subcategory', '==', filters.subcategory);
        }
        if (filters.type) {
            queryRef = queryRef.where('type', '==', filters.type);
        }
        if (filters.status) {
            queryRef = queryRef.where('status', '==', filters.status);
        }
        const snapshot = await queryRef.get();
        let products = (0, firebase_2.mapQuery)(snapshot);
        // Apply client-side filters for search and price ranges to avoid index requirements
        if (filters.priceRange) {
            const tenThousandRupeesInPaise = 1000000;
            if (filters.priceRange === 'below10k') {
                products = products.filter(p => p.price < tenThousandRupeesInPaise);
            }
            else {
                products = products.filter(p => p.price >= tenThousandRupeesInPaise);
            }
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.fabric.toLowerCase().includes(searchLower) ||
                p.sku.toLowerCase().includes(searchLower));
        }
        // Apply pagination slice bounds
        const total = products.length;
        const startIndex = (pagination.page - 1) * pagination.limit;
        const paginatedProducts = products.slice(startIndex, startIndex + pagination.limit);
        return {
            items: paginatedProducts,
            total,
        };
    }
}
exports.ProductRepository = ProductRepository;
exports.default = ProductRepository;
