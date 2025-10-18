import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { RoleUtilisateur } from '../types';

/**
 * Validation pour l'inscription
 */
export const register = [
  body('email')
    .trim()
    .isEmail()
    .withMessage("Format d'email invalide"),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),

  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis'),

  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis'),

  body('role')
    .optional()
    .isIn(Object.values(RoleUtilisateur))
    .withMessage('Rôle invalide'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Validation pour la connexion
 */
export const login = [
  body('email')
    .trim()
    .isEmail()
    .withMessage("Format d'email invalide"),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Validation pour la demande de réinitialisation de mot de passe
 */
export const forgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage("Format d'email invalide"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Validation pour la réinitialisation du mot de passe
 */
export const resetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Le token est requis'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];