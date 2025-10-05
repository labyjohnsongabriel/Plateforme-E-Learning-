import { Request, Response, NextFunction } from 'express';
import { NotificationData } from '../../types';
/**
 * Contrôleur pour gérer les notifications des utilisateurs.
 */
declare class NotificationController {
    /**
     * Récupère toutes les notifications d'un utilisateur authentifié.
     * @param req - Requête Express avec utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getForUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Marque une notification comme lue.
     * @param req - Requête Express avec paramètre ID et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static markAsRead: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprime une notification.
     * @param req - Requête Express avec paramètre ID et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crée une nouvelle notification.
     * @param req - Requête Express avec corps et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static create: (req: Request<{}, {}, NotificationData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crée plusieurs notifications pour une liste d'utilisateurs.
     * @param req - Requête Express avec corps et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static createBatch: (req: Request<{}, {}, NotificationData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Envoie une notification (met à jour dateEnvoi).
     * @param req - Requête Express avec paramètre ID et utilisateur authentifié
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static envoyer: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default NotificationController;
//# sourceMappingURL=NotificationController.d.ts.map