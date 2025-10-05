import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { NiveauFormation } from '../models/enums/NiveauFormation';

/**
 * @desc Validation for creating a course
 */
export const create = [
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('domaine').isMongoId().withMessage('Domaine ID invalide'),
  body('niveau').isIn(Object.values(NiveauFormation)).withMessage('Niveau de formation invalide'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for updating a course
 */
export const update = [
  body('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
  body('domaine').optional().isMongoId().withMessage('Domaine ID invalide'),
  body('niveau').optional().isIn(Object.values(NiveauFormation)).withMessage('Niveau de formation invalide'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for creating course content
 */
export const createContenu = [
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').optional().trim(),
  body('cours').isMongoId().withMessage('Cours ID invalide'),
  body('type').isIn(['video', 'document']).withMessage('Type de contenu invalide'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for updating course content
 */
export const updateContenu = [
  body('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('description').optional().trim(),
  body('type').optional().isIn(['video', 'document']).withMessage('Type de contenu invalide'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for creating a quiz
 */
export const createQuiz = [
  body('cours').isMongoId().withMessage('Cours ID invalide'),
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('questions').isArray({ min: 1 }).withMessage('Au moins une question est requise'),
  body('questions.*.texte').trim().notEmpty().withMessage('Le texte de la question est requis'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Chaque question doit avoir au moins deux options'),
  body('questions.*.correctAnswer').trim().notEmpty().withMessage('La réponse correcte est requise'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for updating a quiz
 */
export const updateQuiz = [
  body('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('questions').optional().isArray({ min: 1 }).withMessage('Au moins une question est requise'),
  body('questions.*.texte').optional().trim().notEmpty().withMessage('Le texte de la question ne peut pas être vide'),
  body('questions.*.options').optional().isArray({ min: 2 }).withMessage('Chaque question doit avoir au moins deux options'),
  body('questions.*.correctAnswer').optional().trim().notEmpty().withMessage('La réponse correcte est requise'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for submitting a quiz
 */
export const submitQuiz = [
  body('reponses').isArray({ min: 1 }).withMessage('Au moins une réponse est requise'),
  body('reponses.*').trim().notEmpty().withMessage('Chaque réponse doit être non vide'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for creating a domain
 */
export const createDomaine = [
  body('nom').trim().notEmpty().withMessage('Le nom du domaine est requis'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @desc Validation for updating a domain
 */
export const updateDomaine = [
  body('nom').optional().trim().notEmpty().withMessage('Le nom du domaine ne peut pas être vide'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];