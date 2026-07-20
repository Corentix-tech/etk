"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => async (req, res, next) => {
    try {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        // Replace request fields with parsed, coerced, and validated values
        if (parsed.body !== undefined)
            req.body = parsed.body;
        if (parsed.query !== undefined)
            req.query = parsed.query;
        if (parsed.params !== undefined)
            req.params = parsed.params;
        next();
    }
    catch (error) {
        next(error); // Pass ZodError to the global error handler
    }
};
exports.validate = validate;
exports.default = exports.validate;
