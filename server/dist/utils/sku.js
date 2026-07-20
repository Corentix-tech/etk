"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSku = exports.getFabricCode = exports.getCategoryCode = void 0;
/**
 * Resolves the 3-letter category code based on product category.
 * @param category Product Category (e.g. "WOMEN", "MEN", "KIDS")
 */
const getCategoryCode = (category) => {
    const upper = category.toUpperCase().trim();
    if (upper === 'WOMEN')
        return 'WOM';
    if (upper === 'MEN')
        return 'MEN';
    if (upper === 'KIDS')
        return 'KID';
    return 'GEN';
};
exports.getCategoryCode = getCategoryCode;
/**
 * Resolves the 3-letter fabric code based on textile material description.
 * @param fabric Product Fabric name (e.g. "Mulberry Silk", "Banarasi Brocade")
 */
const getFabricCode = (fabric) => {
    const upper = fabric.toUpperCase().trim();
    if (upper.includes('SILK') && !upper.includes('COTTON') && !upper.includes('TUSSAR') && !upper.includes('CHANDERI'))
        return 'SIL';
    if (upper.includes('BROCADE'))
        return 'BRO';
    if (upper.includes('CHANDERI'))
        return 'CHA';
    if (upper.includes('GEORGETTE'))
        return 'GEO';
    if (upper.includes('ORGANZA'))
        return 'ORG';
    if (upper.includes('TUSSAR'))
        return 'TUS';
    if (upper.includes('COTTON'))
        return 'COT';
    return 'GEN';
};
exports.getFabricCode = getFabricCode;
/**
 * Auto-generates a product SKU following the structured format: {CATEGORY_CODE}-{FABRIC_CODE}-{SEQUENCE}
 * @param category Product Category
 * @param fabric Product Fabric
 * @param sequence Unique sequence number (will be padded to 4 digits)
 */
const generateSku = (category, fabric, sequence) => {
    const cat = (0, exports.getCategoryCode)(category);
    const fab = (0, exports.getFabricCode)(fabric);
    const seqStr = String(sequence).padStart(4, '0');
    return `${cat}-${fab}-${seqStr}`;
};
exports.generateSku = generateSku;
exports.default = {
    getCategoryCode: exports.getCategoryCode,
    getFabricCode: exports.getFabricCode,
    generateSku: exports.generateSku,
};
