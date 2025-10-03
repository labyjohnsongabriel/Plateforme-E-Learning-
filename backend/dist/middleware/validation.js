"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (validator) => (req, res, next) => {
    const { error } = validator(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
//# sourceMappingURL=validation.js.map