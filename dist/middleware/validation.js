"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware de validation
const validation = (validator) => (req, res, next) => {
    const { error } = validator.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        res.status(400).json({ error: 'Validation error', details: errorMessages });
        return;
    }
    next();
};
exports.default = validation;
//# sourceMappingURL=validation.js.map