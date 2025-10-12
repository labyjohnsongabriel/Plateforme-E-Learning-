import Inscription, { IInscription } from '../../models/learning/Inscription';
import createError from 'http-errors';
import { StatutInscription } from '../../types';

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
      const inscription = await Inscription.create({ apprenant, cours, statut: 'EN_COURS' });
      return inscription.populate('cours', 'titre description');
    } catch (error) {
      throw createError(500, 'Erreur lors de l’inscription au cours');
    }
  }

  /**
   * Retrieves all enrollments for a user.
   */
  static async getUserEnrollments(apprenant: string): Promise<IInscription[]> {
    try {
      console.log(`Fetching enrollments from DB for user ${apprenant}`);
      const enrollments = await Inscription.find({ apprenant }).populate('cours', 'titre description');
      return enrollments;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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

      await inscription.save();
      return inscription.populate('cours', 'titre description');
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
      return { message: 'Inscription supprimée avec succès' };
    } catch (error) {
      throw createError(500, 'Erreur lors de la suppression de l’inscription');
    }
  }
}

export default InscriptionService;