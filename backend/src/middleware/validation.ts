import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

// Middleware de validation pour express-validator
const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Exécute toutes les validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

export default validate;