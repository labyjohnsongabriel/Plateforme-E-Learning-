import { Request, Response, NextFunction } from 'express';
import { RoleUtilisateur } from '../models/user/User';
/**
 * @desc Middleware d'authentification JWT
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Middleware suivant
 */
interface CustomRequest extends Request {
    user?: {
        id: string;
        role: RoleUtilisateur;
    };
}
declare const authMiddleware: (req: CustomRequest, res: Response, next: NextFunction) => void;
export default authMiddleware;
//# sourceMappingURL=auth.d.ts.map