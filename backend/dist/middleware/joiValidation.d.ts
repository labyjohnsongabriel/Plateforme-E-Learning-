import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
/**
 * Middleware de validation Joi pour Express
 * @param schema - Schéma Joi à valider
 * @returns Middleware Express
 */
export declare const joiValidation: (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export default joiValidation;
//# sourceMappingURL=joiValidation.d.ts.map