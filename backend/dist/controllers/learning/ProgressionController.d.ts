import { Request, Response, NextFunction } from 'express';
import { ProgressionUpdateData } from '../../types';
/**
 * Contrôleur pour gérer la progression des utilisateurs dans les cours.
 */
declare class ProgressionController {
    /**
     * Récupère la progression d'un utilisateur pour un cours spécifique.
     */
    static getByUserAndCourse: (req: Request<{
        coursId: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour la progression d'un utilisateur et génère un certificat si nécessaire.
     */
    static update: (req: Request<{
        coursId: string;
    }, {}, ProgressionUpdateData>, res: Response, next: NextFunction) => Promise<void>;
}
export default ProgressionController;
//# sourceMappingURL=ProgressionController.d.ts.map