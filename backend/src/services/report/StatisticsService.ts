// src/services/report/StatisticsService.ts
import createError from 'http-errors';
import { Types, FlattenMaps } from 'mongoose';
import { User, IUser, RoleUtilisateur } from '../../models/user/User';
import Course from '../../models/course/Cours';
import ProgressionModel, { IProgression } from '../../models/learning/Progression';
import CertificatModel, { ICertificat } from '../../models/learning/Certificat';
import InscriptionModel, { IInscription } from '../../models/learning/Inscription';

/**
 * Interface pour les statistiques globales, alignée avec AdminDashboard.jsx
 */
interface GlobalStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  usersByRole: Record<RoleUtilisateur, number>;
  recentActivities: { description: string; date: string }[];
  coursesData: { newUsers: number; completed: number }[];
}

/**
 * Interface pour les statistiques d'un utilisateur
 */
interface UserStats {
  user: { nom: string; prenom: string; role: RoleUtilisateur };
  enrollments: number;
  progressions: number;
  completions: number;
  certificates: number;
  averageProgress: number;
}

/**
 * Interface pour les statistiques d'un cours
 */
interface CourseStats {
  cours: { titre: string; niveau: string; domaine: string };
  enrollments: number;
  completions: number;
  certificates: number;
}

/**
 * Interface pour les résultats d'agrégation
 */
interface RoleAggregationResult {
  role: RoleUtilisateur | null;
  count: number;
}

interface MonthAggregationResult {
  _id: string;
  newUsers: number;
}

/**
 * Interface pour une inscription peuplée
 */
interface PopulatedInscription extends Omit<FlattenMaps<IInscription>, 'apprenant' | 'cours'> {
  apprenant?: { nom: string; prenom: string };
  cours?: { titre: string };
}

/**
 * --- Statistiques globales ---
 */
export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    console.log('Fetching global stats from database');
    const [
      totalUsers,
      totalCourses,
      totalInscriptions,
      completedInscriptions,
      recentInscriptions,
      usersByRole,
      newUsersByMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      InscriptionModel.countDocuments(),
      ProgressionModel.countDocuments({ pourcentage: 100 }),
      InscriptionModel.find()
        .sort({ dateInscription: -1 })
        .limit(5)
        .populate<{ apprenant: { nom: string; prenom: string } }>('apprenant', 'nom prenom')
        .populate<{ cours: { titre: string } }>('cours', 'titre')
        .lean(),
      User.aggregate<RoleAggregationResult>([
        { $match: { role: { $in: Object.values(RoleUtilisateur) } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $project: { _id: 0, role: '$_id', count: 1 } },
      ]),
      User.aggregate<MonthAggregationResult>([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const completionRate =
      totalInscriptions > 0
        ? Math.round((completedInscriptions / totalInscriptions) * 100)
        : 0;

    const recentActivities = recentInscriptions.map((ins: PopulatedInscription) => ({
      description: `${ins.apprenant?.nom || 'Utilisateur'} ${ins.apprenant?.prenom || ''} s'est inscrit au cours "${ins.cours?.titre || 'Inconnu'}"`,
      date: ins.dateInscription.toISOString(),
    }));

    const usersByRoleMap = usersByRole.reduce<Record<RoleUtilisateur, number>>(
      (acc: Record<RoleUtilisateur, number>, { role, count }: RoleAggregationResult) => {
        if (!role) return acc;
        return { ...acc, [role]: count };
      },
      {
        [RoleUtilisateur.ETUDIANT]: 0,
        [RoleUtilisateur.ENSEIGNANT]: 0,
        [RoleUtilisateur.ADMIN]: 0,
      }
    );

    const coursesData = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((_, i: number) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      const monthKey = date.toISOString().slice(0, 7);
      const found = newUsersByMonth.find((r: MonthAggregationResult) => r._id === monthKey);
      return { newUsers: found ? found.newUsers : 0, completed: 0 };
    });

    return {
      totalUsers,
      totalCourses,
      totalEnrollments: totalInscriptions,
      completionRate,
      usersByRole: usersByRoleMap,
      recentActivities,
      coursesData,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getGlobalStats:', errorMessage, err instanceof Error ? err.stack : '');
    throw createError(
      500,
      `Erreur lors de la récupération des statistiques globales: ${errorMessage}`
    );
  }
};

/**
 * --- Statistiques pour un utilisateur ---
 */
export const getUserStats = async (userId: string | Types.ObjectId): Promise<UserStats> => {
  try {
    console.log(`Fetching stats for user: ${userId}`);
    
    // Convertir en ObjectId si nécessaire
    const userObjectId = userId instanceof Types.ObjectId ? userId : new Types.ObjectId(userId);
    
    const user = await User.findById(userObjectId);
    if (!user) throw createError(404, 'Utilisateur non trouvé');

    const [enrollments, progressions, completions, certificates] = await Promise.all([
      InscriptionModel.countDocuments({ apprenant: userObjectId }),
      ProgressionModel.countDocuments({ apprenant: userObjectId }),
      ProgressionModel.countDocuments({ apprenant: userObjectId, pourcentage: 100 }),
      CertificatModel.countDocuments({ apprenant: userObjectId }),
    ]);

    const averageProgressResult = await ProgressionModel.aggregate<{ avg: number }>([
      { $match: { apprenant: userObjectId } },
      { $group: { _id: null, avg: { $avg: '$pourcentage' } } },
    ]);

    return {
      user: { nom: user.nom, prenom: user.prenom, role: user.role },
      enrollments,
      progressions,
      completions,
      certificates,
      averageProgress: averageProgressResult[0]?.avg || 0,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getUserStats:', errorMessage, err instanceof Error ? err.stack : '');
    throw createError(
      500,
      `Erreur lors de la récupération des statistiques utilisateur: ${errorMessage}`
    );
  }
};

/**
 * --- Statistiques pour un cours ---
 */
export const getCourseStats = async (coursId: string | Types.ObjectId): Promise<CourseStats> => {
  try {
    console.log(`Fetching stats for course: ${coursId}`);
    
    // Convertir en ObjectId si nécessaire
    const courseObjectId = coursId instanceof Types.ObjectId ? coursId : new Types.ObjectId(coursId);
    
    const cours = await Course.findById(courseObjectId).populate<{ domaineId: { nom: string } }>(
      'domaineId',
      'nom'
    );
    if (!cours) throw createError(404, 'Cours non trouvé');

    const [enrollments, completions, certificates] = await Promise.all([
      InscriptionModel.countDocuments({ cours: courseObjectId }),
      ProgressionModel.countDocuments({ cours: courseObjectId, pourcentage: 100 }),
      CertificatModel.countDocuments({ cours: courseObjectId }),
    ]);

    return {
      cours: {
        titre: cours.titre,
        niveau: cours.niveau,
        domaine: cours.domaineId?.nom || 'Inconnu',
      },
      enrollments,
      completions,
      certificates,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getCourseStats:', errorMessage, err instanceof Error ? err.stack : '');
    throw createError(
      500,
      `Erreur lors de la récupération des statistiques du cours: ${errorMessage}`
    );
  }
};

/**
 * --- Utilisateurs récents ---
 */
export const getRecentUsers = async (limit: number = 10): Promise<Partial<IUser>[]> => {
  try {
    console.log(`Fetching recent users, limit: ${limit}`);
    return await User.find({ role: RoleUtilisateur.ETUDIANT })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('nom prenom email createdAt');
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getRecentUsers:', errorMessage, err instanceof Error ? err.stack : '');
    throw createError(500, `Erreur lors de la récupération des utilisateurs récents: ${errorMessage}`);
  }
};

/**
 * --- Taux global de complétion ---
 */
export const getCompletionRate = async (): Promise<{ rate: number }> => {
  try {
    console.log('Fetching global completion rate');
    const [totalEnrollments, totalCompletions] = await Promise.all([
      InscriptionModel.countDocuments(),
      ProgressionModel.countDocuments({ pourcentage: 100 }),
    ]);
    return {
      rate: totalEnrollments > 0
        ? Math.round((totalCompletions / totalEnrollments) * 100)
        : 0,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getCompletionRate:', errorMessage, err instanceof Error ? err.stack : '');
    throw createError(
      500,
      `Erreur lors de la récupération du taux de complétion: ${errorMessage}`
    );
  }
};