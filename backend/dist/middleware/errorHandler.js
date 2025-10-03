"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("../utils/logger");
module.exports = (err, req, res, next) => {
    logger.error(err.message);
    res.status(500).json({ error: "Server error" });
};
//# sourceMappingURL=errorHandler.js.map