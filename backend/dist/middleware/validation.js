"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// Middleware de validation pour express-validator
const validate = (validations) => {
    return async (req, res, next) => {
        // Exécute toutes les validations
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    };
};
exports.default = validate;
//# sourceMappingURL=validation.js.map