import { Request, Response, NextFunction } from 'express';
import { UserData } from '../../types';
/**
 * Contrôleur pour gérer les utilisateurs.
 */
declare class UserController {
    static getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static getById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    static update: (req: Request<{
        id: string;
    }, {}, UserData>, res: Response, next: NextFunction) => Promise<void>;
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export { UserController };
//# sourceMappingURL=UserController.d.ts.map