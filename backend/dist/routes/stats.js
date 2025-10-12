"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StatsController_1 = __importDefault(require("../controllers/stats/StatsController")); // Import par défaut
const router = (0, express_1.Router)();
/**
 * @route GET /api/stats
 * @desc Récupérer les statistiques globales (e.g., pour le catalogue)
 * @access Public
 */
router.get('/', StatsController_1.default.getStats);
exports.default = router;
//# sourceMappingURL=stats.js.map