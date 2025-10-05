import { Request, Response, NextFunction } from 'express';
import { UserData, CourseCreateData, CourseUpdateData } from '../../types';
/**
 * Contrôleur pour gérer les fonctionnalités administratives.
 */
declare class AdministrateurController {
    /**
     * Récupère les statistiques globales du système.
     */
    static getGlobalStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère les statistiques d'un utilisateur spécifique.
     */
    static getUserStats: (req: Request<{
        userId: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère les statistiques d'un cours spécifique.
     */
    static getCourseStats: (req: Request<{
        coursId: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère tous les utilisateurs.
     */
    static getAllUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour un utilisateur.
     */
    static updateUser: (req: Request<{
        userId: string;
    }, {}, UserData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprime un utilisateur.
     */
    static deleteUser: (req: Request<{
        userId: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crée un nouveau cours.
     */
    static createCourse: (req: Request<{}, {}, CourseCreateData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Récupère tous les cours.
     */
    static getAllCourses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Met à jour un cours.
     */
    static updateCourse: (req: Request<{
        coursId: string;
    }, {}, CourseUpdateData>, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Supprime un cours.
     */
    static deleteCourse: (req: Request<{
        coursId: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
}
export default AdministrateurController;
//# sourceMappingURL=AdministrateurController.d.ts.map