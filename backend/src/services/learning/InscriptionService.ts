// src/services/learning/InscriptionService.ts
import Inscription, { IInscription } from '../../models/learning/Inscription';
import Cours from '../../models/course/Cours'; // Ajout pour mettre à jour le cours
import Progression from '../../models/learning/Progression'; // Ajout pour créer une progression initiale
import createError from 'http-errors';
import { StatutInscription } from '../../models/enums/StatutInscription';

class InscriptionService {
  /**
   * Enrolls a user in a course.
   */
  static async enroll(apprenant: string, cours: string): Promise<IInscription> {
    try {
      const existing = await Inscription.findOne({ apprenant, cours });
      if (existing) {
        throw createError(409, 'Utilisateur déjà inscrit à ce cours');
      }
      const inscription = await Inscription.create({ apprenant, cours, statut: StatutInscription.EN_COURS });
      // Mettre à jour le cours avec l'étudiant
      await Cours.findByIdAndUpdate(cours, { $addToSet: { etudiants: apprenant } });
      // Créer une progression initiale
      await Progression.create({ user: apprenant, cours, pourcentage: 0 });
      return inscription.populate('cours', 'title description');
    } catch (error) {
      throw createError(500, 'Erreur lors de l’inscription au cours');
    }
  }

  /**
   * Retrieves all enrollments for a user.
   */
  static async getUserEnrollments(apprenant: string): Promise<IInscription[]> {
    try {
      const enrollments = await Inscription.find({ apprenant }).populate('cours', 'title description');
      return enrollments;
    } catch (error) {
      throw createError(500, 'Erreur lors de la récupération des inscriptions');
    }
  }

  /**
   * Updates the status of an enrollment.
   */
  static async updateStatus(
    inscriptionId: string,
    statut: StatutInscription,
    apprenant: string
  ): Promise<IInscription> {
    try {
      const inscription = await Inscription.findOne({ _id: inscriptionId, apprenant });
      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }
      inscription.statut = statut;
      await inscription.save();
      return inscription.populate('cours', 'title description');
    } catch (error) {
      throw createError(500, 'Erreur lors de la mise à jour du statut');
    }
  }

  /**
   * Deletes an enrollment.
   */
  static async deleteEnrollment(inscriptionId: string, apprenant: string): Promise<{ message: string }> {
    try {
      const inscription = await Inscription.findOneAndDelete({ _id: inscriptionId, apprenant });
      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }
      // Retirer l'étudiant du cours
      await Cours.findByIdAndUpdate(inscription.cours, { $pull: { etudiants: apprenant } });
      // Supprimer la progression associée
      await Progression.deleteOne({ user: apprenant, cours: inscription.cours });
      return { message: 'Inscription supprimée avec succès' };
    } catch (error) {
      throw createError(500, 'Erreur lors de la suppression de l’inscription');
    }
  }
}

export default InscriptionService;