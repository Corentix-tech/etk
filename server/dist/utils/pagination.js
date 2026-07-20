"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationMetadata = void 0;
/**
 * Calculates pagination metadata.
 * @param totalItems Total count of records matching query
 * @param page Current page index (1-based)
 * @param limit Number of records per page
 */
const getPaginationMetadata = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
exports.getPaginationMetadata = getPaginationMetadata;
exports.default = {
    getPaginationMetadata: exports.getPaginationMetadata,
};
