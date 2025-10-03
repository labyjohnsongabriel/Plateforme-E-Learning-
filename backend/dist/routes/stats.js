"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/stats.js
const express = require("express");
const router = express.Router();
const StatsController = require("../controllers/stats/StatsController"); // Adjust path
/**
 * @route GET /api/stats
 * @desc Récupérer les statistiques globales (e.g., pour le catalogue)
 * @access Public (or Privé if authMiddleware is used)
 */
router.get("/", StatsController.getStats); // Remove authMiddleware to make it public
module.exports = router;
//# sourceMappingURL=stats.js.map