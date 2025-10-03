import { Request, Response, NextFunction } from 'express';
import { CertificatDocument } from '../../types';
/**
 * Contrôleur pour gérer les certificats.
 */
declare class CertificatController {
    /**
     * Récupère tous les certificats d'un utilisateur authentifié.
     * @param req - Requête Express avec utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getByUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Télécharge un certificat PDF.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static download: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Génère un certificat PDF pour un utilisateur et un cours.
     * @param apprenantId - ID de l'utilisateur
     * @param coursId - ID du cours
     * @returns Le certificat créé ou existant, ou null si le niveau est Alfa
     */
    static generateCertificate: (apprenantId: string, coursId: string) => Promise<CertificatDocument | null>;
}
export default CertificatController;
//# sourceMappingURL=CertificatController.d.ts.map