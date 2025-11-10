// src/routes/statsRoutes.ts
import { Router } from 'express';
import StatsController from '../controllers/stats/StatsController';

const router: Router = Router();

/**
 * @route GET /api/stats
 * @desc Récupérer les statistiques globales
 * @access Public
 */
router.get('/', StatsController.getStats);

/**
 * @route GET /api/stats/users/:userId
 * @desc Récupérer les statistiques d'un utilisateur spécifique
 * @access Public
 */
router.get('/users/:userId', StatsController.getUserStats);

/**
 * @route GET /api/stats/courses/:courseId
 * @desc Récupérer les statistiques d'un cours spécifique
 * @access Public
 */
router.get('/courses/:courseId', StatsController.getCourseStats);

/**
 * @route GET /api/stats/users
 * @desc Récupérer les utilisateurs récents
 * @access Public
 */
router.get('/users', StatsController.getRecentUsers);

/**
 * @route GET /api/stats/completion-rate
 * @desc Récupérer le taux de complétion global
 * @access Public
 */
router.get('/completion-rate', StatsController.getCompletionRate);

export default router;