import { Router, Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth/AuthController'; // Default import
import ProfileController from '../controllers/auth/ProfileController'; // Default import
import authMiddleware from '../middleware/auth';
import { register, login } from '../validators/authValidator'; // Changed to named imports

const router: Router = Router();

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post(
  '/register',
  register, // Use named import directly
  AuthController.register as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post(
  '/login',
  login, // Use named import directly
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