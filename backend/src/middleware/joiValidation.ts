// src/middleware/joiValidation.ts
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

/**
 * Middleware de validation Joi pour Express
 * @param schema - Schéma Joi à valider
 * @returns Middleware Express
 */
export const joiValidation = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false, // Retourne toutes les erreurs, pas seulement la première
      allowUnknown: false // Rejette les champs non définis dans le schéma
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      res.status(400).json({ 
        message: 'Données de requête invalides',
        errors: errorDetails
      });
      return;
    }
    
    next();
  };
};

export default joiValidation;