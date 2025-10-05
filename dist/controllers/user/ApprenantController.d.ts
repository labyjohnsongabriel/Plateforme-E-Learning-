import { Request, Response, NextFunction } from 'express';
import { EnrollData, ProgressData } from '../../types';
/**
 * Contrôleur pour gérer les fonctionnalités des apprenants.
 */
declare class ApprenantController {
    /**
     * Récupère les progrès d'un apprenant.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getProgress: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère les certificats d'un apprenant.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getCertificates: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Inscrit un apprenant à un cours.
     * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static enrollInCourse: (req: Request<{
        id: string;
    }, {}, EnrollData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour la progression d'un apprenant pour un cours.
     * @param req - Requête Express avec paramètre ID, corps et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static updateProgress: (req: Request<{
        id: string;
    }, {}, ProgressData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère le profil d'un apprenant.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getProfile: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default ApprenantController;
//# sourceMappingURL=ApprenantController.d.ts.map