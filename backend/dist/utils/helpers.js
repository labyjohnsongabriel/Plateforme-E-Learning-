"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    isEligibleForCertificate: (niveau) => ["beta", "gamma", "delta"].includes(niveau.toLowerCase()),
    generateUniqueId: () => Date.now().toString(36) + Math.random().toString(36).substring(2),
};
//# sourceMappingURL=helpers.js.map