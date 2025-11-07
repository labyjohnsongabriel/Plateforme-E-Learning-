import { Request, Response } from 'express';
import { getGlobalStats } from '../../services/report/StatisticsService';

class StatsController {
  static getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Début de la récupération des statistiques globales');
      
      const stats = await getGlobalStats();
      
      // Transformation des rôles
      const transformUsersByRole = (usersByRole: any) => {
        if (!usersByRole) return { admin: 0, instructor: 0, student: 0 };
        
        return {
          admin: Number(usersByRole.ADMIN || usersByRole.admin || 0),
          instructor: Number(usersByRole.ENSEIGNANT || usersByRole.instructor || 0),
          student: Number(usersByRole.ETUDIANT || usersByRole.student || 0)
        };
      };

      const responseData = {
        totalUsers: Number(stats.totalUsers) || 0,
        totalCourses: Number(stats.totalCourses) || 0,
        completionRate: Number(stats.completionRate) || 0,
        usersByRole: transformUsersByRole(stats.usersByRole),
       // categories: Array.isArray(stats.categories) ? stats.categories : [],
        totalEnrollments: Number(stats.totalEnrollments) || 0,
        recentActivities: Array.isArray(stats.recentActivities) ? stats.recentActivities : [],
        coursesData: Array.isArray(stats.coursesData) ? stats.coursesData : [],
      };

      console.log('Statistiques récupérées avec succès');
      
      res.status(200).json(responseData);

    } catch (error) {
      console.error('Erreur dans StatsController:', error);
      
      res.status(500).json({
        totalUsers: 0,
        totalCourses: 0,
        completionRate: 0,
        usersByRole: { admin: 0, instructor: 0, student: 0 },
    //    categories: [],
        totalEnrollments: 0,
        recentActivities: [],
        coursesData: [],
      });
    }
  };
}

export default StatsController;