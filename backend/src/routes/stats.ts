import { Router, Request, Response, NextFunction } from 'express';
import StatsController from '../controllers/stats/StatsController'; // Import par défaut

const router: Router = Router();

/**
 * @route GET /api/stats
 * @desc Récupérer les statistiques globales (e.g., pour le catalogue)
 * @access Public
 */
router.get('/', StatsController.getStats);

export default router;