import { Router, Request, Response, NextFunction } from 'express';
import * as AuthController from '../controllers/auth/AuthController';
import * as ProfileController from '../controllers/auth/ProfileController';
import authMiddleware from '../middleware/auth';
import * as authValidator from '../validators/authValidator';

const router: Router = Router();

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post(
  '/register',
  authValidator.register,
  AuthController.register as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post(
  '/login',
  authValidator.login,
  AuthController.login as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route GET /api/auth/me
 * @desc Récupérer les informations de l'utilisateur authentifié
 * @access Privé
 */
router.get(
  '/me',
  authMiddleware,
  AuthController.getMe as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route GET /api/auth/profile
 * @desc Récupérer le profil utilisateur
 * @access Privé
 */
router.get(
  '/profile',
  authMiddleware,
  ProfileController.getProfile as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route PUT /api/auth/profile
 * @desc Mettre à jour le profil utilisateur
 * @access Privé
 */
router.put(
  '/profile',
  authMiddleware,
  ProfileController.updateProfile as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

export default router;