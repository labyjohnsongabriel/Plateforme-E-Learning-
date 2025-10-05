"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rateLimit = require("express-rate-limit");
module.exports = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
//# sourceMappingURL=rateLimit.js.map