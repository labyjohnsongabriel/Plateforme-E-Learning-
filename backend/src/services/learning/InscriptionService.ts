import { Types } from 'mongoose';
import createError from 'http-errors';
import InscriptionModel, { IInscription } from '../../models/learning/Inscription';
import Course from '../../models/course/Cours';
import { StatutInscription } from '../../models/enums/StatutInscription';

class InscriptionService {
  // =======================
  // ✅ INSCRIPTION D'UN UTILISATEUR
  // =======================
  static enroll = async (userId: string, coursId: string) => {
    try {
      console.log(`Tentative d'inscription - User: ${userId}, Cours: ${coursId}`);

      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(coursId)) {
        throw createError(400, 'Identifiants invalides');
      }

      const cours = await Course.findById(coursId);
      if (!cours) {
        throw createError(404, 'Cours non trouvé');
      }

      const existingInscription = await InscriptionModel.findOne({
        apprenant: userId,
        cours: coursId,
      });

      if (existingInscription) {
        throw createError(409, 'Vous êtes déjà inscrit à ce cours');
      }

      const inscription = new InscriptionModel({
        apprenant: userId,
        cours: coursId,
        dateInscription: new Date(),
        statut: StatutInscription.ACTIVE,
      });

      await inscription.save();

      const populatedInscription = await InscriptionModel.findById(inscription._id)
        .populate('apprenant', 'nom prenom email')
        .populate({
          path: 'cours',
          select: 'titre description niveau domaineId instructeurId createur duree image datePublication estPublie',
          populate: [
            {
              path: 'domaineId',
              select: 'nom description'
            },
            {
              path: 'instructeurId',
              select: 'nom prenom email'
            },
            {
              path: 'createur',
              select: 'nom prenom email'
            }
          ]
        })
        .lean();

      console.log('Inscription créée avec succès:', populatedInscription?._id);
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

      const inscriptions = await InscriptionModel.find({ apprenant: userId })
        .populate({
          path: 'cours',
          select: 'titre description niveau duree image domaineId instructeurId createur datePublication estPublie progression',
          populate: [
            {
              path: 'domaineId',
              select: 'nom description'
            },
            {
              path: 'instructeurId', // CORRECTION: instructeurId au lieu de instructeur
              select: 'nom prenom email'
            },
            {
              path: 'createur',
              select: 'nom prenom email'
            }
          ]
        })
        .populate('apprenant', 'nom prenom email')
        .sort({ dateInscription: -1 })
        .lean();

      console.log(`Nombre d'inscriptions trouvées: ${inscriptions.length}`);

      const validInscriptions = inscriptions.filter(inscription => {
        try {
          if (!inscription._id || !inscription.cours) {
            console.warn('Inscription invalide ignorée (champs manquants):', inscription);
            return false;
          }

          if (typeof inscription.cours !== 'object' || !inscription.cours._id) {
            console.warn('Inscription invalide ignorée (cours invalide):', inscription);
            return false;
          }

          return true;
        } catch (error) {
          console.warn('Erreur lors de la validation de l\'inscription:', error, inscription);
          return false;
        }
      });

      console.log(`Nombre d'inscriptions valides: ${validInscriptions.length}`);
      return validInscriptions;

    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions:', error);
      throw error;
    }
  };

  // =======================
  // ✅ MISE À JOUR DU STATUT D'UNE INSCRIPTION
  // =======================
  static updateStatus = async (inscriptionId: string, statut: StatutInscription, userId: string) => {
    try {
      console.log(`Mise à jour du statut - Inscription: ${inscriptionId}, Statut: ${statut}`);

      if (!Types.ObjectId.isValid(inscriptionId)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionModel.findOne({
        _id: inscriptionId,
        apprenant: userId
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
              path: 'instructeurId', // CORRECTION: instructeurId au lieu de instructeur
              select: 'nom prenom email'
            },
            {
              path: 'createur',
              select: 'nom prenom email'
            }
          ]
        })
        .populate('apprenant', 'nom prenom email')
        .lean();

      return updatedInscription;

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  };

  // =======================
  // ✅ SUPPRESSION D'UNE INSCRIPTION
  // =======================
  static deleteEnrollment = async (inscriptionId: string, userId: string) => {
    try {
      console.log(`Suppression d'inscription - Inscription: ${inscriptionId}, User: ${userId}`);

      if (!Types.ObjectId.isValid(inscriptionId)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionModel.findOne({
        _id: inscriptionId,
        apprenant: userId
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
  // ✅ STATISTIQUES DES INSCRIPTIONS
  // =======================
  static getEnrollmentStats = async (userId: string) => {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw createError(400, 'Identifiant utilisateur invalide');
      }

      const stats = await InscriptionModel.aggregate([
        { $match: { apprenant: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$statut',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>);

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
        apprenant: userId,
        cours: coursId,
        statut: StatutInscription.ACTIVE
      });

      return !!inscription;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'inscription:', error);
      return false;
    }
  };

  // =======================
  // ✅ RÉCUPÉRER UNE INSCRIPTION SPÉCIFIQUE
  // =======================
  static getEnrollmentById = async (inscriptionId: string, userId: string) => {
    try {
      if (!Types.ObjectId.isValid(inscriptionId)) {
        throw createError(400, 'Identifiant d\'inscription invalide');
      }

      const inscription = await InscriptionModel.findOne({
        _id: inscriptionId,
        apprenant: userId
      })
        .populate({
          path: 'cours',
          select: 'titre description niveau duree image domaineId instructeurId createur datePublication estPublie progression contenu',
          populate: [
            {
              path: 'domaineId',
              select: 'nom description'
            },
            {
              path: 'instructeurId', // CORRECTION: instructeurId au lieu de instructeur
              select: 'nom prenom email'
            },
            {
              path: 'createur',
              select: 'nom prenom email'
            }
          ]
        })
        .populate('apprenant', 'nom prenom email')
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