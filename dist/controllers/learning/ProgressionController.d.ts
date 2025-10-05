import { Request, Response, NextFunction } from 'express';
import { ProgressionUpdateData } from '../../types';
/**
 * Contrôleur pour gérer la progression des utilisateurs dans les cours.
 */
declare class ProgressionController {
    /**
     * Récupère la progression d'un utilisateur pour un cours spécifique.
     * @param req - Requête Express avec paramètre coursId et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getByUserAndCourse: (req: Request<{
        coursId: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour la progression d'un utilisateur dans un cours et génère un certificat si nécessaire.
     * @param req - Requête Express avec paramètre coursId, corps (pourcentage), et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static update: (req: Request<{
        coursId: string;
    }, {}, ProgressionUpdateData>, res: Response, next: NextFunction) => Promise<void>;
}
export default ProgressionController;
//# sourceMappingURL=ProgressionController.d.ts.map