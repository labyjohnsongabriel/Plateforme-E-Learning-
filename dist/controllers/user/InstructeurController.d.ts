import { Request, Response, NextFunction } from 'express';
import { CourseCreateData, CourseUpdateData, ApprovalData } from '../../types';
/**
 * Contrôleur pour gérer les fonctionnalités des instructeurs.
 */
declare class InstructeurController {
    /**
     * Récupère les cours créés par un instructeur.
     */
    static getCourses: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crée un nouveau cours pour un instructeur.
     */
    static createCourse: (req: Request<{
        id: string;
    }, {}, CourseCreateData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour un cours créé par un instructeur.
     */
    static updateCourse: (req: Request<{
        id: string;
    }, {}, CourseUpdateData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Soumet un cours pour approbation.
     */
    static submitForApproval: (req: Request<{
        id: string;
    }, {}, ApprovalData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère les cours en cours d'édition par un instructeur.
     */
    static getCoursesInProgress: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère le profil d'un instructeur.
     */
    static getProfile: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default InstructeurController;
//# sourceMappingURL=InstructeurController.d.ts.map