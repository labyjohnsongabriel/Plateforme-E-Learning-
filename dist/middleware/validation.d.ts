import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
type Validator = ObjectSchema;
declare const validation: (validator: Validator) => (req: Request, res: Response, next: NextFunction) => void;
export default validation;
//# sourceMappingURL=validation.d.ts.map