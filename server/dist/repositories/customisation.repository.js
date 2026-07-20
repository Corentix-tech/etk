"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomisationRepository = void 0;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../utils/firebase");
class CustomisationRepository {
    static collectionName = 'customisations';
    /**
     * Retrieves a single customisation request by ID.
     * @param id Customisation document ID
     */
    async findById(id) {
        const doc = await firebase_1.db.collection(CustomisationRepository.collectionName).doc(id).get();
        return (0, firebase_2.mapDoc)(doc);
    }
    /**
     * Creates a new customisation request document.
     * @param customisation Customisation request details
     */
    async create(customisation) {
        const docRef = firebase_1.db.collection(CustomisationRepository.collectionName).doc();
        const now = new Date().toISOString();
        const dataToSave = {
            ...customisation,
            createdAt: now,
            updatedAt: now,
            adminNotes: customisation.adminNotes || [],
        };
        await docRef.set(dataToSave);
        return { id: docRef.id, ...dataToSave };
    }
    /**
     * Updates an existing customisation request parameters.
     * @param id Customisation document ID
     * @param data Partial customisation details
     */
    async update(id, data) {
        const docRef = firebase_1.db.collection(CustomisationRepository.collectionName).doc(id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...data,
            updatedAt: now,
        };
        await docRef.update(dataToUpdate);
        return this.findById(id);
    }
    /**
     * Lists customisation requests matching filters with page offsets.
     * @param filters Query filter keys
     * @param pagination Page index and limit
     */
    async list(filters, pagination) {
        let queryRef = firebase_1.db.collection(CustomisationRepository.collectionName);
        // Apply exact match filters
        if (filters.userId) {
            queryRef = queryRef.where('userId', '==', filters.userId);
        }
        if (filters.status) {
            queryRef = queryRef.where('status', '==', filters.status);
        }
        // Default sorting order by creation date (descending)
        queryRef = queryRef.orderBy('createdAt', 'desc');
        const snapshot = await queryRef.get();
        const customisations = (0, firebase_2.mapQuery)(snapshot);
        const total = customisations.length;
        const startIndex = (pagination.page - 1) * pagination.limit;
        const paginatedItems = customisations.slice(startIndex, startIndex + pagination.limit);
        return {
            items: paginatedItems,
            total,
        };
    }
    /**
     * Lists all requests belonging to a specific client.
     * @param userId Client document ID
     */
    async findByUserId(userId) {
        const querySnapshot = await firebase_1.db
            .collection(CustomisationRepository.collectionName)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return (0, firebase_2.mapQuery)(querySnapshot);
    }
}
exports.CustomisationRepository = CustomisationRepository;
exports.default = CustomisationRepository;
