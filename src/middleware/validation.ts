// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema, ValidationError } from 'joi';

// Type pour le validateur Joi
type Validator = ObjectSchema; // Plus spécifique que (data: any) => { error?: Joi.ValidationError }

// Middleware de validation
const validation = (validator: Validator) => (req: Request, res: Response, next: NextFunction): void => {
  const { error } = validator.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    res.status(400).json({ error: 'Validation error', details: errorMessages });
    return;
  }
  next();
};

export default validation;