import { Types } from 'mongoose';
import createError from 'http-errors';
import InscriptionModel, { IInscription } from '../../models/learning/Inscription';
import Course from '../../models/course/Cours';
import { StatutInscription } from '../../models/enums/StatutInscription';

class InscriptionService {
  // =======================
  // ✅ INSCRIPTION D'UN UTILISATEUR - CORRIGÉ
  // =======================
  static enroll = async (userId: string, coursId: string) => {
    try {
      console.log(`Tentative d'inscription - User: ${userId}, Cours: ${coursId}`);

      // Validation des IDs
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'Identifiants invalides');
      }

      // Vérification que le cours existe et est publié
      const cours = await Course.findById(coursId)
        .select('titre description niveau domaineId instructeurId createur duree image datePublication estPublie')
        .lean();
      
      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      if (!cours.estPublie) {
        throw createError(400, 'Ce cours n\'est pas encore publié');
      }

      // Vérification de l'inscription existante
      const existingInscription = await InscriptionModel.findOne({
        apprenant: new Types.ObjectId(userId),
        cours: new Types.ObjectId(coursId),
      });

      if (existingInscription) {
        throw createError(409, 'Vous êtes déjà inscrit à ce cours');
      }

      // Création de l'inscription
      const inscription = new InscriptionModel({
        apprenant: new Types.ObjectId(userId),
        cours: new Types.ObjectId(coursId),
        dateInscription: new Date(),
        statut: StatutInscription.ACTIVE,
      });

      await inscription.save();

      // Population avec gestion des erreurs
      const populatedInscription = await InscriptionModel.findById(inscription._id)
        .populate('apprenant', 'nom prenom email photo')
        .populate({
          path: 'cours',
          select: 'titre description niveau domaineId instructeurId createur duree image datePublication estPublie',
          populate: [
            {
              path: 'domaineId',
              select: 'nom description icone'
            },
            {
              path: 'instructeurId',
              select: 'nom prenom email photo bio specialites'
            },
            {
              path: 'createur',
              select: 'nom prenom email photo'
            }
          ]
        })
        .lean();

      if (!populatedInscription) {
        throw createError(500, 'Erreur lors de la création de l\'inscription');
      }

      console.log('Inscription créée avec succès:', populatedInscription._id);
      return populatedInscription;

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  // =======================
  // ✅ RÉCUPÉRER LES INSCRIPTIONS D'UN UTILISATEUR - CORRIGÉ
  // =======================
  static getUserEnrollments = async (userId: string) => {
    try {
      console.log(`Récupération des inscriptions pour l'utilisateur: ${userId}`);

      if (!Types.ObjectId.isValid(userId)) {
        throw createError(400, 'Identifiant utilisateur invalide');
      }

      const inscriptions = await InscriptionModel.find({ 
        apprenant: new Types.ObjectId(userId) 
      })
        .populate({
          path: 'cours',
          select: 'titre description niveau duree image domaineId instructeurId createur datePublication estPublie progression',
          populate: [
            {
              path: 'domaineId',
              select: 'nom description icone couleur'
            },
            {
              path: 'instructeurId',
              select: 'nom prenom email photo bio specialites rating nombreEtudiants'
            },
            {
              path: 'createur',
              select: 'nom prenom email photo'
            }
          ]
        })
        .populate('apprenant', 'nom prenom email photo')
        .sort({ dateInscription: -1 })
        .lean();

      console.log(`Nombre d'inscriptions trouvées: ${inscriptions.length}`);

      // Filtrage des inscriptions valides avec gestion d'erreur robuste
      const validInscriptions = inscriptions.filter(inscription => {
        try {
          // Vérification de la structure de base
          if (!inscription || !inscription._id) {
            console.warn('Inscription invalide: structure manquante');
            return false;
          }

          // Vérification que le cours existe et est peuplé correctement
          if (!inscription.cours || typeof inscription.cours !== 'object') {
            console.warn('Inscription invalide: cours non peuplé ou invalide');
            return false;
          }

          // Vérification que le cours a les champs requis
          const cours = inscription.cours as any;
          if (!cours.titre || !cours._id) {
            console.warn('Inscription invalide: cours incomplet');
            return false;
          }

          return true;
        } catch (filterError) {
          console.warn('Erreur lors du filtrage d\'une inscription:', filterError);
          return false;
        }
      });

      console.log(`Nombre d'inscriptions valides après filtrage: ${validInscriptions.length}`);
      return validInscriptions;

    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions:', error);
      throw error;
    }
  };

  // =======================
  // ✅ RÉCUPÉRER LES ÉTUDIANTS D'UN INSTRUCTEUR - NOUVELLE MÉTHODE
  // =======================
  static getInstructorStudents = async (instructorId: string) => {
    try {
      console.log(`Récupération des étudiants pour l'instructeur: ${instructorId}`);

      if (!Types.ObjectId.isValid(instructorId)) {
        throw createError(400, 'Identifiant instructeur invalide');
      }

      // Récupérer tous les cours de l'instructeur
      const instructorCourses = await Course.find({
        $or: [
          { instructeurId: new Types.ObjectId(instructorId) },
          { createur: new Types.ObjectId(instructorId) }
        ],
        estPublie: true
      }).select('_id').lean();

      const courseIds = instructorCourses.map(course => course._id);

      if (courseIds.length === 0) {
        return {
          students: [],
          totalStudents: 0,
          coursesCount: 0
        };
      }

      // Récupérer toutes les inscriptions pour ces cours
      const inscriptions = await InscriptionModel.find({
        cours: { $in: courseIds },
        statut: StatutInscription.ACTIVE
      })
        .populate('apprenant', 'nom prenom email photo dateInscription lastLogin')
        .populate({
          path: 'cours',
          select: 'titre niveau duree'
        })
        .sort({ dateInscription: -1 })
        .lean();

      // Compter les étudiants uniques
      const uniqueStudents = new Map();
      inscriptions.forEach(inscription => {
        const studentId = (inscription.apprenant as any)._id.toString();
        if (!uniqueStudents.has(studentId)) {
          uniqueStudents.set(studentId, {
            student: inscription.apprenant,
            firstEnrollment: inscription.dateInscription,
            coursesCount: 1,
            courses: [inscription.cours]
          });
        } else {
          const existing = uniqueStudents.get(studentId);
          existing.coursesCount += 1;
          existing.courses.push(inscription.cours);
        }
      });

      const studentsData = Array.from(uniqueStudents.values());

      return {
        students: studentsData,
        totalStudents: uniqueStudents.size,
        coursesCount: courseIds.length,
        totalEnrollments: inscriptions.length
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
      throw error;
    }
  };

  // =======================
  // ✅ STATISTIQUES D'UN INSTRUCTEUR - NOUVELLE MÉTHODE
  // =======================
  static getInstructorStats = async (instructorId: string) => {
    try {
      if (!Types.ObjectId.isValid(instructorId)) {
        throw createError(400, 'Identifiant instructeur invalide');
      }

      // Cours de l'instructeur
      const courses = await Course.find({
        $or: [
          { instructeurId: new Types.ObjectId(instructorId) },
          { createur: new Types.ObjectId(instructorId) }
        ]
      }).select('_id titre estPublie').lean();

      const courseIds = courses.map(course => course._id);

      if (courseIds.length === 0) {
        return {
          totalCourses: 0,
          publishedCourses: 0,
          totalStudents: 0,
          totalEnrollments: 0,
          completionRate: 0
        };
      }

      // Statistiques des inscriptions
      const stats = await InscriptionModel.aggregate([
        {
          $match: {
            cours: { $in: courseIds }
          }
        },
        {
          $group: {
            _id: '$statut',
            count: { $sum: 1 },
            uniqueStudents: { $addToSet: '$apprenant' }
          }
        }
      ]);

      let totalEnrollments = 0;
      let completedEnrollments = 0;
      const uniqueStudents = new Set();

      stats.forEach(stat => {
        totalEnrollments += stat.count;
        if (stat._id === StatutInscription.COMPLETE) {
          completedEnrollments = stat.count;
        }
        stat.uniqueStudents.forEach((studentId: Types.ObjectId) => {
          uniqueStudents.add(studentId.toString());
        });
      });

      const completionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100) 
        : 0;

      return {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.estPublie).length,
        totalStudents: uniqueStudents.size,
        totalEnrollments,
        completionRate,
        activeEnrollments: stats.find(s => s._id === StatutInscription.ACTIVE)?.count || 0,
        completedEnrollments
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques instructeur:', error);
      throw error;
    }
  };

  // =======================
  // ✅ MISE À JOUR DU STATUT D'UNE INSCRIPTION - CORRIGÉ
  // =======================
  static updateStatus = async (inscriptionId: string, statut: StatutInscription, userId: string) => {
    try {
      console.log(`Mise à jour du statut - Inscription: ${inscriptionId}, Statut: ${statut}`);

      if (!Types.ObjectId.isValid(inscriptionId)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionModel.findOne({
        _id: new Types.ObjectId(inscriptionId),
        apprenant: new Types.ObjectId(userId)
      });

      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }

      inscription.statut = statut;
      if (statut === StatutInscription.COMPLETE) {
        inscription.dateCompletion = new Date();
      }

      await inscription.save();

      const updatedInscription = await InscriptionModel.findById(inscription._id)
        .populate({
          path: 'cours',
          select: 'titre description niveau instructeurId createur',
          populate: [
            {
              path: 'instructeurId',
              select: 'nom prenom email photo'
            },
            {
              path: 'createur',
              select: 'nom prenom email photo'
            }
          ]
        })
        .populate('apprenant', 'nom prenom email photo')
        .lean();

      return updatedInscription;

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  };

  // =======================
  // ✅ SUPPRESSION D'UNE INSCRIPTION - CORRIGÉ
  // =======================
  static deleteEnrollment = async (inscriptionId: string, userId: string) => {
    try {
      console.log(`Suppression d'inscription - Inscription: ${inscriptionId}, User: ${userId}`);

      if (!Types.ObjectId.isValid(inscriptionId)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionModel.findOne({
        _id: new Types.ObjectId(inscriptionId),
        apprenant: new Types.ObjectId(userId)
      });

      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }

      await InscriptionModel.findByIdAndDelete(inscriptionId);

      return {
        message: 'Inscription supprimée avec succès',
        deletedId: inscriptionId
      };

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'inscription:', error);
      throw error;
    }
  };

  // =======================
  // ✅ STATISTIQUES DES INSCRIPTIONS UTILISATEUR
  // =======================
  static getEnrollmentStats = async (userId: string) => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw createError(400, 'Identifiant utilisateur invalide');
      }

      const stats = await InscriptionModel.aggregate([
        { 
          $match: { 
            apprenant: new Types.ObjectId(userId) 
          } 
        },
        {
          $group: {
            _id: '$statut',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        [StatutInscription.ACTIVE]: 0,
        [StatutInscription.COMPLETE]: 0,
        [StatutInscription.CANCELLED]: 0,
        total: 0
      };

      stats.forEach(stat => {
       // result[stat._id] = stat.count;
        result.total += stat.count;
      });

      return result;

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  // =======================
  // ✅ VÉRIFICATION SI L'UTILISATEUR EST INSCRIT À UN COURS
  // =======================
  static isUserEnrolled = async (userId: string, coursId: string): Promise<boolean> => {
    try {
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(coursId)) {
        return false;
      }

      const inscription = await InscriptionModel.findOne({
        apprenant: new Types.ObjectId(userId),
        cours: new Types.ObjectId(coursId),
        statut: StatutInscription.ACTIVE
      });

      return !!inscription;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription:', error);
      return false;
    }
  };

  // =======================
  // ✅ RÉCUPÉRER UNE INSCRIPTION SPÉCIFIQUE - CORRIGÉ
  // =======================
  static getEnrollmentById = async (inscriptionId: string, userId: string) => {
    try {
      if (!Types.ObjectId.isValid(inscriptionId)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionModel.findOne({
        _id: new Types.ObjectId(inscriptionId),
        apprenant: new Types.ObjectId(userId)
      })
        .populate({
          path: 'cours',
          select: 'titre description niveau duree image domaineId instructeurId createur datePublication estPublie progression',
          populate: [
            {
              path: 'domaineId',
              select: 'nom description icone'
            },
            {
              path: 'instructeurId',
              select: 'nom prenom email photo bio specialites'
            },
            {
              path: 'createur',
              select: 'nom prenom email photo'
            }
          ]
        })
        .populate('apprenant', 'nom prenom email photo')
        .lean();

      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }

      return inscription;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'inscription:', error);
      throw error;
    }
  };
}

export default InscriptionService;