import { Request, Response, NextFunction } from 'express';
import { QuizData, ReponseData } from '../../types';
declare class QuizController {
    /**
     * Crée un nouveau quiz.
     * @param req - Requête Express avec corps
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static create: (req: Request<{}, {}, QuizData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère tous les quizzes.
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère un quiz par son ID.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static getById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour un quiz.
     * @param req - Requête Express avec paramètre ID et corps
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static update: (req: Request<{
        id: string;
    }, {}, Partial<QuizData>>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprime un quiz.
     * @param req - Requête Express avec paramètre ID
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static delete: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Soumet des réponses à un quiz.
     * @param req - Requête Express avec paramètre ID et réponses
     * @param res - Réponse Express
     * @param next - Fonction middleware suivante
     */
    static soumettre: (req: Request<{
        id: string;
    }, {}, {
        reponses: ReponseData;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default QuizController;
//# sourceMappingURL=QuizController.d.ts.map