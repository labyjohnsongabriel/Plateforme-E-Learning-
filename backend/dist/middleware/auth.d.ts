import { Request, Response, NextFunction } from 'express';
import { UserDocument } from '../types';
declare module 'express-serve-static-core' {
    interface Request {
        user?: Partial<UserDocument>;
    }
}
declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export default authMiddleware;
//# sourceMappingURL=auth.d.ts.map