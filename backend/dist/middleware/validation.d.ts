import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default validate;
//# sourceMappingURL=validation.d.ts.map