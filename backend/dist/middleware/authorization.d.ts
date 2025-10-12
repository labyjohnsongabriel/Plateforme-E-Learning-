import { Request, Response, NextFunction } from 'express';
import { RoleUtilisateur } from '../types';
declare const authorize: (allowedRoles: RoleUtilisateur[]) => (req: Request, res: Response, next: NextFunction) => void;
export default authorize;
//# sourceMappingURL=authorization.d.ts.map