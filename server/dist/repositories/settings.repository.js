"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const firebase_1 = require("../config/firebase");
const firebase_2 = require("../utils/firebase");
class SettingsRepository {
    static collectionName = 'storeSettings';
    static docId = 'default';
    /**
     * Fetches the global settings document.
     */
    async get() {
        const doc = await firebase_1.db.collection(SettingsRepository.collectionName).doc(SettingsRepository.docId).get();
        return (0, firebase_2.mapDoc)(doc);
    }
    /**
     * Modifies or initializes the global settings document.
     * @param settings Partial settings parameters
     */
    async update(settings) {
        const docRef = firebase_1.db.collection(SettingsRepository.collectionName).doc(SettingsRepository.docId);
        const now = new Date().toISOString();
        const dataToSave = {
            ...settings,
            updatedAt: now,
        };
        // Use merge: true to avoid erasing unspecified existing configurations
        await docRef.set(dataToSave, { merge: true });
        return this.get();
    }
}
exports.SettingsRepository = SettingsRepository;
exports.default = SettingsRepository;
