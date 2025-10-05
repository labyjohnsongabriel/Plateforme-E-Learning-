import { Types } from 'mongoose';
import createError from 'http-errors';
import User, { IUser, RoleUtilisateur } from '../../models/user/User';
import Cours, { ICours } from '../../models/course/Cours';
import Progression, { IProgression } from '../../models/learning/Progression';
import Certificat, { ICertificat } from '../../models/learning/Certificat';
import Inscription, { IInscription } from '../../models/learning/Inscription';
import * as CoursService from '../../services/learning/CoursService';

// Interface for global stats response
interface GlobalStats {
  usersCount: number;
  adminsCount: number;
  coursesCount: number;
  completionsCount: number;
  certificatesCount: number;
  enrollmentsCount: number;
  coursesByDomain: Record<string, number>;
  completionsByLevel: Record<string, number>;
}

// Interface for user stats response
interface UserStats {
  user: { nom: string; prenom: string; role: RoleUtilisateur };
  enrollments: number;
  progressions: number;
  completions: number;
  certificates: number;
  averageProgress: number;
}

// Interface for course stats response
interface CourseStats {
  cours: { titre: string; niveau: string; domaine: string };
  enrollments: number;
  completions: number;
  certificates: number;
}

// Get all users
export const getAllUsers = async (): Promise<Partial<IUser>[]> => {
  return await User.find().select('-motDePasse');
};

// Update a user
export const updateUser = async (userId: string | Types.ObjectId, data: Partial<IUser>): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, data, { new: true });
};

// Delete a user
export const deleteUser = async (userId: string | Types.ObjectId): Promise<void> => {
  await User.findByIdAndDelete(userId);
  // TODO: Optionally delete associated progressions and certificates
};

// Get global statistics
export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    const [
      usersCount,
      adminsCount,
      coursesCount,
      completionsCount,
      certificatesCount,
      enrollmentsCount,
    ] = await Promise.all([
      User.countDocuments({ role: RoleUtilisateur.ETUDIANT }),
      User.countDocuments({ role: RoleUtilisateur.ADMIN }),
      Cours.countDocuments(),
      Progression.countDocuments({ pourcentage: 100 }),
      Certificat.countDocuments(),
      Inscription.countDocuments(),
    ]);

    const coursesByDomain = await Cours.aggregate([
      { $group: { _id: '$domaine', count: { $sum: 1 } } },
    ]);

    const completionsByLevel = await Progression.aggregate([
      { $match: { pourcentage: 100 } },
      {
        $lookup: {
          from: 'cours',
          localField: 'cours',
          foreignField: '_id',
          as: 'coursDetails',
        },
      },
      { $unwind: '$coursDetails' },
      { $group: { _id: '$coursDetails.niveau', count: { $sum: 1 } } },
    ]);

    return {
      usersCount,
      adminsCount,
      coursesCount,
      completionsCount,
      certificatesCount,
      enrollmentsCount,
      coursesByDomain: coursesByDomain.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {} as Record<string, number>
      ),
      completionsByLevel: completionsByLevel.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {} as Record<string, number>
      ),
    };
  } catch (err) {
    console.error('Erreur lors de la récupération des stats globales:', err);
    throw err;
  }
};

// Get user-specific statistics
export const getUserStats = async (userId: string | Types.ObjectId): Promise<UserStats> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, 'Utilisateur non trouvé');
    }

    const [enrollments, progressions, completions, certificates] = await Promise.all([
      Inscription.countDocuments({ apprenant: userId }),
      Progression.countDocuments({ apprenant: userId }),
      Progression.countDocuments({ apprenant: userId, pourcentage: 100 }),
      Certificat.countDocuments({ apprenant: userId }),
    ]);

    const averageProgress = await Progression.aggregate([
      { $match: { apprenant: userId } },
      { $group: { _id: null, avg: { $avg: '$pourcentage' } } },
    ]);

    return {
      user: { nom: user.nom, prenom: user.prenom, role: user.role },
      enrollments,
      progressions,
      completions,
      certificates,
      averageProgress: averageProgress[0]?.avg || 0,
    };
  } catch (err) {
    throw err;
  }
};

// Get course-specific statistics
export const getCourseStats = async (coursId: string | Types.ObjectId): Promise<CourseStats> => {
  try {
    const cours = await Cours.findById(coursId);
    if (!cours) {
      throw createError(404, 'Cours non trouvé');
    }

    const [enrollments, completions, certificates] = await Promise.all([
      Inscription.countDocuments({ cours: coursId }),
      Progression.countDocuments({ cours: coursId, pourcentage: 100 }),
      Certificat.countDocuments({ cours: coursId }),
    ]);

    return {
      cours: {
        titre: cours.titre,
        niveau: cours.niveau,
        domaine: cours.domaine,
      },
      enrollments,
      completions,
      certificates,
    };
  } catch (err) {
    throw err;
  }
};

// Get recent users
export const getRecentUsers = async (limit: number = 10): Promise<Partial<IUser>[]> => {
  return await User.find({ role: RoleUtilisateur.ETUDIANT })
    .sort({ dateInscription: -1 })
    .limit(limit)
    .select('nom prenom email dateInscription');
};

// Get global completion rate
export const getCompletionRate = async (): Promise<{ rate: number }> => {
  const [totalEnrollments, totalCompletions] = await Promise.all([
    Inscription.countDocuments(),
    Progression.countDocuments({ pourcentage: 100 }),
  ]);
  return {
    rate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0,
  }
};

// Create a course (admin)
export const createCourse = async (data: CourseData): Promise<ICours> => {
  return await CoursService.createCourse(data, null);
};

// Update a course (admin)
export const updateCourse = async (coursId: string | Types.ObjectId, data: CourseData): Promise<ICours | null> => {
  return await CoursService.updateCourse(coursId, data);
};

// Delete a course (admin)
export const deleteCourse = async (coursId: string | Types.ObjectId): Promise<void> => {
  await CoursService.deleteCourse(coursId);
};