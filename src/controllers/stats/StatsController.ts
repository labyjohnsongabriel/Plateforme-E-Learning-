import { Request, Response } from 'express';
import { Course } from '../../models/course/Cours';

/**
 * Interface pour les statistiques des cours.
 */
interface CourseStats {
  totalCourses: number;
  categories: string[];
  totalEnrollments: number;
}

/**
 * Contrôleur pour gérer les statistiques des cours.
 */
class StatsController {
  /**
   * Récupère les statistiques globales des cours.
   * @param req - Requête Express
   * @param res - Réponse Express
   */
  static getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats: CourseStats = {
        totalCourses: await Course.countDocuments(),
        categories: await Course.distinct('category'),
        totalEnrollments: 500, // TODO: Remplacer par une vraie requête
      };
      res.json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', (error as Error).message);
      res.status(500).json({
        message: 'Erreur serveur lors de la récupération des statistiques',
      });
    }
  };
}

export default StatsController;