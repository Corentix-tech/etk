"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Sends a structured success response.
 * @param res Express Response object
 * @param data Response payload data
 * @param message Client status description (defaults to 'Success')
 * @param statusCode HTTP Status Code (defaults to 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    const payload = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(payload);
};
exports.sendSuccess = sendSuccess;
/**
 * Sends a structured error response.
 * @param res Express Response object
 * @param message Client error description (defaults to 'Error')
 * @param errors Array of validation issues or detailed error summaries
 * @param statusCode HTTP Status Code (defaults to 500)
 */
const sendError = (res, message = 'Error', errors = [], statusCode = 500) => {
    const payload = {
        success: false,
        message,
        errors: errors.length > 0 ? errors : [message],
    };
    return res.status(statusCode).json(payload);
};
exports.sendError = sendError;
exports.default = {
    sendSuccess: exports.sendSuccess,
    sendError: exports.sendError,
};
