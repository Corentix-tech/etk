"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = void 0;
/**
 * Transforms a text string into a URL-friendly slug.
 * @param text Raw product name or category string
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};
exports.slugify = slugify;
exports.default = {
    slugify: exports.slugify,
};
