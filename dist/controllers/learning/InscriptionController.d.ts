import { Request, Response, NextFunction } from 'express';
import { InscriptionData } from '../../types';
/**
 * Contrôleur pour gérer les inscriptions des utilisateurs à des cours.
 */
declare class InscriptionController {
    /**
     * Inscrit un utilisateur à un cours.
     * @param req - Requête Express avec corps et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static enroll: (req: Request<{}, {}, InscriptionData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère toutes les inscriptions d'un utilisateur.
     * @param req - Requête Express avec utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getUserEnrollments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour le statut d'une inscription.
     * @param req - Requête Express avec paramètre ID et corps
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static updateStatus: (req: Request<{
        id: string;
    }, {}, {
        statut: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprime une inscription.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default InscriptionController;
//# sourceMappingURL=InscriptionController.d.ts.map