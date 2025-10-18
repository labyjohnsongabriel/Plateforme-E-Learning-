import { Types } from 'mongoose';
import { MongoServerError } from 'mongodb'; // ✅ Correction ici
import createError from 'http-errors';
import Inscription, { IInscription } from '../../models/learning/Inscription';
import Cours from '../../models/course/Cours';
import Progression from '../../models/learning/Progression';
import { StatutInscription } from '../../models/enums/StatutInscription';

class InscriptionService {
  /**
   * Enrôle un utilisateur dans un cours.
   */
  static async enroll(apprenant: string, cours: string): Promise<IInscription> {
    if (!Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }
    if (!Types.ObjectId.isValid(cours)) {
      throw createError(400, 'Identifiant de cours invalide');
    }

    const course = await Cours.findById(cours);
    if (!course) {
      throw createError(404, 'Cours introuvable');
    }

    const existing = await Inscription.findOne({ apprenant, cours });
    if (existing) {
      throw createError(409, 'Utilisateur déjà inscrit à ce cours');
    }

    try {
      const inscription = await Inscription.create({
        apprenant,
        cours,
        statut: StatutInscription.EN_COURS,
        dateInscription: new Date(),
      });

      await Cours.findByIdAndUpdate(cours, { $addToSet: { etudiants: apprenant } });
      await Progression.create({ user: apprenant, cours, pourcentage: 0 });

      return inscription.populate('cours', 'title description');
    } catch (error: unknown) {
      // ✅ Correction de la gestion d'erreur
      if (error instanceof MongoServerError && error.code === 11000) {
        throw createError(409, 'Inscription déjà existante');
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(500, `Erreur lors de l'inscription : ${errorMessage}`);
    }
  }

  /**
   * Récupère toutes les inscriptions d’un utilisateur.
   */
  static async getUserEnrollments(apprenant: string): Promise<IInscription[]> {
    if (!Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }

    try {
      const enrollments = await Inscription.find({ apprenant }).populate(
        'cours',
        'title description'
      );
      return enrollments;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(
        500,
        `Erreur lors de la récupération des inscriptions : ${errorMessage}`
      );
    }
  }

  /**
   * Met à jour le statut d’une inscription.
   */
  static async updateStatus(
    inscriptionId: string,
    statut: StatutInscription,
    apprenant: string
  ): Promise<IInscription> {
    if (!Types.ObjectId.isValid(inscriptionId)) {
      throw createError(400, 'Identifiant d’inscription invalide');
    }
    if (!Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }
    if (!Object.values(StatutInscription).includes(statut)) {
      throw createError(400, 'Statut invalide');
    }

    try {
      const inscription = await Inscription.findOne({
        _id: inscriptionId,
        apprenant,
      });
      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }

      inscription.statut = statut;
      await inscription.save();

      return inscription.populate('cours', 'title description');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(
        500,
        `Erreur lors de la mise à jour du statut : ${errorMessage}`
      );
    }
  }

  /**
   * Supprime une inscription.
   */
  static async deleteEnrollment(
    inscriptionId: string,
    apprenant: string
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(inscriptionId)) {
      throw createError(400, 'Identifiant d’inscription invalide');
    }
    if (!Types.ObjectId.isValid(apprenant)) {
      throw createError(400, 'Identifiant utilisateur invalide');
    }

    try {
      const inscription = await Inscription.findOneAndDelete({
        _id: inscriptionId,
        apprenant,
      });

      if (!inscription) {
        throw createError(404, 'Inscription non trouvée');
      }

      await Cours.findByIdAndUpdate(inscription.cours, {
        $pull: { etudiants: apprenant },
      });

      await Progression.deleteOne({ user: apprenant, cours: inscription.cours });

      return { message: 'Inscription supprimée avec succès' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw createError(
        500,
        `Erreur lors de la suppression de l’inscription : ${errorMessage}`
      );
    }
  }
}

export default InscriptionService;
