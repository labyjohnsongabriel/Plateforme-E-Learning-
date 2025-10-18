import { body, ValidationChain } from 'express-validator';

/**
 * @desc Validation for creating a course
 */
export const create: ValidationChain[] = [
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('domaine').isMongoId().withMessage('Domaine ID invalide'),
  body('niveau')
    .isIn(['ALFA', 'BETA', 'GAMMA', 'DELTA'])
    .withMessage('Niveau de formation invalide. Doit être ALFA, BETA, GAMMA ou DELTA'),
];

/**
 * @desc Validation for updating a course
 */
export const update: ValidationChain[] = [
  body('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
  body('domaine').optional().isMongoId().withMessage('Domaine ID invalide'),
  body('niveau')
    .optional()
    .isIn(['ALFA', 'BETA', 'GAMMA', 'DELTA'])
    .withMessage('Niveau de formation invalide. Doit être ALFA, BETA, GAMMA ou DELTA'),
];

/**
 * @desc Validation for creating course content
 */
export const createContenu: ValidationChain[] = [
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('description').optional().trim(),
  body('cours').isMongoId().withMessage('Cours ID invalide'),
  body('type').isIn(['video', 'document']).withMessage('Type de contenu invalide'),
];

/**
 * @desc Validation for updating course content
 */
export const updateContenu: ValidationChain[] = [
  body('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('description').optional().trim(),
  body('type').optional().isIn(['video', 'document']).withMessage('Type de contenu invalide'),
];

/**
 * @desc Validation for creating a quiz
 */
export const createQuiz: ValidationChain[] = [
  body('cours').isMongoId().withMessage('Cours ID invalide'),
  body('titre').trim().notEmpty().withMessage('Le titre est requis'),
  body('questions').isArray({ min: 1 }).withMessage('Au moins une question est requise'),
  body('questions.*.texte').trim().notEmpty().withMessage('Le texte de la question est requis'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Chaque question doit avoir au moins deux options'),
  body('questions.*.correctAnswer').trim().notEmpty().withMessage('La réponse correcte est requise'),
];

/**
 * @desc Validation for updating a quiz
 */
export const updateQuiz: ValidationChain[] = [
  body('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
  body('questions').optional().isArray({ min: 1 }).withMessage('Au moins une question est requise'),
  body('questions.*.texte').optional().trim().notEmpty().withMessage('Le texte de la question ne peut pas être vide'),
  body('questions.*.options').optional().isArray({ min: 2 }).withMessage('Chaque question doit avoir au moins deux options'),
  body('questions.*.correctAnswer').optional().trim().notEmpty().withMessage('La réponse correcte est requise'),
];

/**
 * @desc Validation for submitting a quiz
 */
export const submitQuiz: ValidationChain[] = [
  body('reponses').isArray({ min: 1 }).withMessage('Au moins une réponse est requise'),
  body('reponses.*').trim().notEmpty().withMessage('Chaque réponse doit être non vide'),
];

/**
 * @desc Validation for creating a domain
 */
export const createDomaine: ValidationChain[] = [
  body('nom').trim().notEmpty().withMessage('Le nom du domaine est requis'),
];

/**
 * @desc Validation for updating a domain
 */
export const updateDomaine: ValidationChain[] = [
  body('nom').optional().trim().notEmpty().withMessage('Le nom du domaine ne peut pas être vide'),
];