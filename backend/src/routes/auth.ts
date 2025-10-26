import { Router, Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth/AuthController';
import ProfileController from '../controllers/auth/ProfileController';
import authMiddleware from '../middleware/auth';
import { register, login, forgotPassword, resetPassword } from '../validators/authValidator';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router: Router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${req.user?.id}-${uniqueSuffix}-${file.originalname}`;
    console.log('Multer filename:', filename);
    cb(null, filename);
  },
});

// Define fileFilter without explicit type to allow TypeScript inference
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('File filter processing:', { mimetype: file.mimetype, originalname: file.originalname });
  if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
    cb(null, true);
  } else {
   // cb(new Error('Type de fichier non supporté. Utilisez JPEG ou PNG.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter,
}).single('avatar');

// Multer error handling middleware
const multerErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Multer middleware processing:', {
    body: req.body,
    file: req.file,
    error: err ? err.message : null,
  });
  if (err instanceof multer.MulterError) {
    console.error('Erreur Multer:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message === 'File too large'
        ? 'Le fichier dépasse la limite de 2MB'
        : 'Erreur lors du téléchargement du fichier',
    });
  } else if (err) {
    console.error('Erreur fichier:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post(
  '/register',
  register,
  AuthController.register as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route POST /api/auth/login
 * @desc Connexion d'un utilisateur
 * @access Public
 */
router.post(
  '/login',
  login,
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
  upload,
  multerErrorHandler,
  ProfileController.updateProfile as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Demander un lien de réinitialisation de mot de passe
 * @access Public
 */
router.post(
  '/forgot-password',
  forgotPassword,
  AuthController.forgotPassword as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

/**
 * @route POST /api/auth/reset-password
 * @desc Réinitialiser le mot de passe avec un token
 * @access Public
 */
router.post(
  '/reset-password',
  resetPassword,
  AuthController.resetPassword as (req: Request, res: Response, next: NextFunction) => Promise<void>
);

export default router;