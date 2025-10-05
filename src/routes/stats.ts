import { Router, Request, Response, NextFunction } from 'express';
import * as StatsController from '../controllers/stats/StatsController';

const router: Router = Router();

/**
 * @route GET /api/stats
 * @desc Récupérer les statistiques globales (e.g., pour le catalogue)
 * @access Public
 */
router.get('/', StatsController.getStats as (req: Request, res: Response, next: NextFunction) => Promise<void>);

export default router;