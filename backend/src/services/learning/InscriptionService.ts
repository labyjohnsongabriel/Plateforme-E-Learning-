// src/services/learning/InscriptionService.ts
import { Types } from 'mongoose';
import { MongoServerError } from 'mongodb';
import createError from 'http-errors';
import Inscription, { IInscription } from '../../models/learning/Inscription';
import Cours from '../../models/course/Cours';
import Progression from '../../models/learning/Progression';
import { StatutInscription } from '../../models/enums/StatutInscription';

class InscriptionService {
  /**
   * Enrôle un utilisateur dans un cours - CORRIGÉ
   */
  static async enroll(apprenant: string, coursId: string): Promise<IInscription> {
    // ✅ Validation renforcée
    if (!apprenant || !Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }
    if (!coursId || !Types.ObjectId.isValid(coursId)) {
      throw createError(400, 'Identifiant de cours invalide');
    }

    const course = await Cours.findById(coursId);
    if (!course) {
      throw createError(404, 'Cours introuvable');
    }

    // ✅ Vérification d'existence avec cours valide
    const existing = await Inscription.findOne({ 
      apprenant, 
      cours: coursId 
    });
    if (existing) {
      throw createError(409, 'Utilisateur déjà inscrit à ce cours');
    }

    try {
      const inscription = await Inscription.create({
        apprenant: new Types.ObjectId(apprenant),
        cours: new Types.ObjectId(coursId),
        statut: StatutInscription.EN_COURS,
        dateInscription: new Date(),
      });

      // ✅ Mise à jour du cours
      await Cours.findByIdAndUpdate(coursId, { 
        $addToSet: { etudiants: apprenant } 
      });

      // ✅ CORRECTION: Création de la progression avec le bon champ
      await Progression.create({ 
        apprenant: new Types.ObjectId(apprenant), // ✅ Changé de 'user' à 'apprenant'
        cours: new Types.ObjectId(coursId), 
        pourcentage: 0 
      });

      return await inscription.populate('cours', 'titre description');
    } catch (error: unknown) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw createError(409, 'Inscription déjà existante');
      }
      
      // ✅ Gestion spécifique des erreurs de validation
      if (error instanceof Error && error.message.includes('cours')) {
        throw createError(400, `Erreur de validation: ${error.message}`);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(500, `Erreur lors de l'inscription : ${errorMessage}`);
    }
  }

  /**
   * Récupère toutes les inscriptions d'un utilisateur
   */
  static async getUserEnrollments(apprenant: string): Promise<IInscription[]> {
    if (!apprenant || !Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }

    try {
      const enrollments = await Inscription.find({ 
        apprenant,
        cours: { $ne: null }
      }).populate('cours', 'titre description');

      return enrollments as IInscription[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(
        500,
        `Erreur lors de la récupération des inscriptions : ${errorMessage}`
      );
    }
  }

  /**
   * Met à jour le statut d'une inscription
   */
  static async updateStatus(
    inscriptionId: string,
    statut: StatutInscription,
    apprenant: string
  ): Promise<IInscription> {
    if (!inscriptionId || !Types.ObjectId.isValid(inscriptionId)) {
      throw createError(400, 'Identifiant d\'inscription invalide');
    }
    if (!apprenant || !Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }
    if (!Object.values(StatutInscription).includes(statut)) {
      throw createError(400, 'Statut invalide');
    }

    try {
      const inscription = await Inscription.findOne({
        _id: inscriptionId,
        apprenant,
        cours: { $ne: null }
      });
      
      if (!inscription) {
        throw createError(404, 'Inscription non trouvée ou invalide');
      }

      inscription.statut = statut;
      await inscription.save();

      return await inscription.populate('cours', 'titre description');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(
        500,
        `Erreur lors de la mise à jour du statut : ${errorMessage}`
      );
    }
  }

  /**
   * Supprime une inscription - CORRIGÉ
   */
  static async deleteEnrollment(
    inscriptionId: string,
    apprenant: string
  ): Promise<{ message: string }> {
    if (!inscriptionId || !Types.ObjectId.isValid(inscriptionId)) {
      throw createError(400, 'Identifiant d\'inscription invalide');
    }
    if (!apprenant || !Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }

    try {
      const inscription = await Inscription.findOneAndDelete({
        _id: inscriptionId,
        apprenant,
        cours: { $ne: null }
      });

      if (!inscription) {
        throw createError(404, 'Inscription non trouvée ou invalide');
      }

      // ✅ CORRECTION: Nettoyage avec le bon champ
      if (inscription.cours) {
        await Cours.findByIdAndUpdate(inscription.cours, {
          $pull: { etudiants: apprenant },
        });

        await Progression.deleteOne({ 
          apprenant: new Types.ObjectId(apprenant), // ✅ Changé de 'user' à 'apprenant'
          cours: inscription.cours 
        });
      }

      return { message: 'Inscription supprimée avec succès' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(
        500,
        `Erreur lors de la suppression de l'inscription : ${errorMessage}`
      );
    }
  }
}

export default InscriptionService;