"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookbookRepository = void 0;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../utils/firebase");
class LookbookRepository {
    static collectionName = 'lookVideos';
    /**
     * Retrieves a single lookbook video record by ID.
     * @param id Lookbook document ID
     */
    async findById(id) {
        const doc = await firebase_1.db.collection(LookbookRepository.collectionName).doc(id).get();
        return (0, firebase_2.mapDoc)(doc);
    }
    /**
     * Creates a new lookbook video document.
     * @param lookbook Lookbook request details
     */
    async create(lookbook) {
        const docRef = firebase_1.db.collection(LookbookRepository.collectionName).doc();
        const now = new Date().toISOString();
        const dataToSave = {
            ...lookbook,
            createdAt: now,
            updatedAt: now,
        };
        await docRef.set(dataToSave);
        return { id: docRef.id, ...dataToSave };
    }
    /**
     * Updates an existing lookbook video tags or coordinates.
     * @param id Lookbook document ID
     * @param data Partial lookbook details
     */
    async update(id, data) {
        const docRef = firebase_1.db.collection(LookbookRepository.collectionName).doc(id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...data,
            updatedAt: now,
        };
        await docRef.update(dataToUpdate);
        return this.findById(id);
    }
    /**
     * Removes a lookbook video document.
     * @param id Lookbook document ID
     */
    async delete(id) {
        await firebase_1.db.collection(LookbookRepository.collectionName).doc(id).delete();
    }
    /**
     * Lists lookbook videos with page offsets.
     * @param pagination Page index and limit
     */
    async list(pagination) {
        let queryRef = firebase_1.db.collection(LookbookRepository.collectionName);
        // Sort by creation date (descending)
        queryRef = queryRef.orderBy('createdAt', 'desc');
        const snapshot = await queryRef.get();
        const lookbooks = (0, firebase_2.mapQuery)(snapshot);
        const total = lookbooks.length;
        const startIndex = (pagination.page - 1) * pagination.limit;
        const paginatedItems = lookbooks.slice(startIndex, startIndex + pagination.limit);
        return {
            items: paginatedItems,
            total,
        };
    }
}
exports.LookbookRepository = LookbookRepository;
exports.default = LookbookRepository;
