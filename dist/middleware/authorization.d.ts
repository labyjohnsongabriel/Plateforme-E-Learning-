import { Request, Response, NextFunction } from 'express';
import { RoleUtilisateur } from '../models/user/User';
declare const authorize: (allowedRoles: RoleUtilisateur[]) => (req: Request, res: Response, next: NextFunction) => void;
export default authorize;
//# sourceMappingURL=authorization.d.ts.map