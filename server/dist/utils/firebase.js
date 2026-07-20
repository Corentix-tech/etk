"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapQuery = exports.mapDoc = exports.parseFirestoreTimestamps = exports.convertTimestamp = void 0;
const firestore_1 = require("firebase-admin/firestore");
/**
 * Converts a Firebase Timestamp object to a JavaScript Date, or returns null.
 * @param value Potential Timestamp value
 */
const convertTimestamp = (value) => {
    if (!value)
        return null;
    if (value instanceof firestore_1.Timestamp) {
        return value.toDate();
    }
    if (typeof value === 'object' && typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
        return new firestore_1.Timestamp(value.seconds, value.nanoseconds).toDate();
    }
    return new Date(value);
};
exports.convertTimestamp = convertTimestamp;
/**
 * Recursively parses Firestore document objects to convert all embedded Timestamp instances to ISO strings.
 * @param data Firestore data object
 */
const parseFirestoreTimestamps = (data) => {
    if (data === null || data === undefined)
        return data;
    if (data instanceof firestore_1.Timestamp) {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(item => (0, exports.parseFirestoreTimestamps)(item));
    }
    if (typeof data === 'object') {
        const parsed = {};
        for (const key of Object.keys(data)) {
            parsed[key] = (0, exports.parseFirestoreTimestamps)(data[key]);
        }
        return parsed;
    }
    return data;
};
exports.parseFirestoreTimestamps = parseFirestoreTimestamps;
/**
 * Maps a single DocumentSnapshot to a parsed object, appending its ID.
 * @param doc Firestore DocumentSnapshot
 */
const mapDoc = (doc) => {
    if (!doc.exists)
        return null;
    const data = doc.data();
    return {
        id: doc.id,
        ...(0, exports.parseFirestoreTimestamps)(data),
    };
};
exports.mapDoc = mapDoc;
/**
 * Maps a QuerySnapshot array to parsed objects, appending their IDs.
 * @param snapshot Firestore QuerySnapshot
 */
const mapQuery = (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
        const parsed = (0, exports.mapDoc)(doc);
        if (parsed) {
            list.push(parsed);
        }
    });
    return list;
};
exports.mapQuery = mapQuery;
exports.default = {
    convertTimestamp: exports.convertTimestamp,
    parseFirestoreTimestamps: exports.parseFirestoreTimestamps,
    mapDoc: exports.mapDoc,
    mapQuery: exports.mapQuery,
};
