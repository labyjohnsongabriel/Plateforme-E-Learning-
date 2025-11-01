import { Request, Response } from 'express';
import { getGlobalStats } from '../../services/report/StatisticsService';

/**
 * Contrôleur pour gérer les statistiques globales.
 */
class StatsController {
  static getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Début de la récupération des statistiques globales');
      
      const stats = await getGlobalStats();
      
      const responseData = {
        totalUsers: stats.totalUsers || 0,
        totalCourses: stats.totalCourses || 0,
        completionRate: stats.completionRate || 0,
        usersByRole: stats.usersByRole || { admin: 0, instructor: 0, student: 0 },
      //  categories: stats.categories || [],
        totalEnrollments: stats.totalEnrollments || 0,
        recentActivities: stats.recentActivities || [],
        coursesData: stats.coursesData || [],
      };

      console.log('Statistiques récupérées avec succès:', {
        totalUsers: responseData.totalUsers,
        totalCourses: responseData.totalCourses,
        completionRate: responseData.completionRate,
      });

      res.status(200).json(responseData);
    } catch (error) {
      console.error('Erreur détaillée dans StatsController:', error);
      res.status(500).json({
        message: 'Erreur serveur lors de la récupération des statistiques',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      });
    }
  };
}

export default StatsController;
