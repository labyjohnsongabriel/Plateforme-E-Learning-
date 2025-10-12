import { Request, Response } from 'express';
/**
 * Contrôleur pour gérer les statistiques des cours.
 */
declare class StatsController {
    /**
     * Récupère les statistiques globales des cours.
     * @param req - Requête Express
     * @param res - Réponse Express
     */
    static getStats: (req: Request, res: Response) => Promise<void>;
}
export default StatsController;
//# sourceMappingURL=StatsController.d.ts.map