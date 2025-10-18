import { body, ValidationChain } from 'express-validator';

// Validation rules for creating a module
export const createModule: ValidationChain[] = [
  body('titre')
    .trim()
    .notEmpty()
    .withMessage('Le titre du module est requis')
    .isLength({ max: 255 })
    .withMessage('Le titre ne doit pas dépasser 255 caractères'),
  body('contenu')
    .optional()
    .isString()
    .withMessage('Le contenu doit être une chaîne de caractères'),
  body('ordre')
    .isInt({ min: 1 })
    .withMessage('L’ordre doit être un entier positif')
    .toInt(),
  body('coursId')
    .isMongoId()
    .withMessage('L’ID du cours doit être un ObjectId valide'),
];

// Validation rules for updating a module
export const updateModule: ValidationChain[] = [
  body('titre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le titre du module est requis')
    .isLength({ max: 255 })
    .withMessage('Le titre ne doit pas dépasser 255 caractères'),
  body('contenu')
    .optional()
    .isString()
    .withMessage('Le contenu doit être une chaîne de caractères'),
  body('ordre')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L’ordre doit être un entier positif')
    .toInt(),
  body('coursId')
    .optional()
    .isMongoId()
    .withMessage('L’ID du cours doit être un ObjectId valide'),
];