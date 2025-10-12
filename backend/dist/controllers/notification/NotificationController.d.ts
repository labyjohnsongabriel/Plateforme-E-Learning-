import { Request, Response, NextFunction } from 'express';
import { NotificationData } from '../../types';
/**
 * Contrôleur pour gérer les notifications des utilisateurs.
 */
declare class NotificationController {
    /**
     * Récupère toutes les notifications d'un utilisateur authentifié.
     */
    static getForUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Marque une notification comme lue.
     */
    static markAsRead: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprime une notification.
     */
    static deleteNotification: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crée une nouvelle notification.
     */
    static create: (req: Request<{}, {}, NotificationData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crée plusieurs notifications pour une liste d'utilisateurs.
     */
    static createBatch: (req: Request<{}, {}, any>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Envoie une notification (met à jour dateEnvoi).
     */
    static envoyer: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default NotificationController;
//# sourceMappingURL=NotificationController.d.ts.map