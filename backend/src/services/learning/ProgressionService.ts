// src/services/learning/ProgressionService.ts
import { Types } from 'mongoose';
import Progression, { IProgression } from '../../models/learning/Progression';
import Cours, { ICours } from '../../models/course/Cours';

/**
 * Enumération des statuts de progression.
 */
export enum StatutProgression {
  EN_COURS = 'EN_COURS',
  COMPLETE = 'COMPLETE',
}

/**
 * Interface for the default progression object to avoid type mismatches.
 */
interface IProgressionDefault {
  apprenant: string;
  cours: string;
  pourcentage: number;
  dateDebut: Date | null;
  dateDerniereActivite: Date | null;
  dateFin: Date | null;
  statut: StatutProgression;
}

/**
 * Service pour gérer la progression des apprenants dans les cours.
 */
export class ProgressionService {
  /**
   * 🔹 Initialise une progression pour un apprenant dans un cours.
   * Si la progression existe déjà, elle est retournée.
   */
  static async initialize(
    apprenantId: string | Types.ObjectId,
    coursId: string | Types.ObjectId
  ): Promise<IProgression> {
    try {
      if (!Types.ObjectId.isValid(apprenantId) || !Types.ObjectId.isValid(coursId)) {
        throw new Error('Identifiant invalide');
      }

      const existing = await Progression.findOne({ apprenant: apprenantId, cours: coursId });
      if (existing) return existing;

      const cours = await Cours.findById(coursId);
      if (!cours) {
        throw new Error('Cours non trouvé');
      }

      const progression = new Progression({
        apprenant: apprenantId,
        cours: coursId,
        dateDebut: new Date(),
        dateDerniereActivite: new Date(),
        statut: StatutProgression.EN_COURS,
        pourcentage: 0,
      });

      await progression.save();
      return progression;
    } catch (err) {
      console.error('❌ Erreur lors de l’initialisation de la progression :', err);
      throw err;
    }
  }

  /**
   * 🔹 Met à jour la progression d’un apprenant pour un cours donné.
   */
  static async update(
    apprenantId: string | Types.ObjectId,
    coursId: string | Types.ObjectId,
    pourcentage: number
  ): Promise<IProgression> {
    try {
      if (!Types.ObjectId.isValid(apprenantId) || !Types.ObjectId.isValid(coursId)) {
        throw new Error('Identifiant invalide');
      }

      if (pourcentage < 0 || pourcentage > 100) {
        throw new Error('Pourcentage invalide (doit être entre 0 et 100)');
      }

      let progression = await Progression.findOne({ apprenant: apprenantId, cours: coursId });
      if (!progression) {
        const cours = await Cours.findById(coursId);
        if (!cours) {
          throw new Error('Cours non trouvé');
        }
        progression = new Progression({
          apprenant: apprenantId,
          cours: coursId,
          dateDebut: new Date(),
          dateDerniereActivite: new Date(),
          statut: StatutProgression.EN_COURS,
          pourcentage: 0,
        });
      }

      progression.pourcentage = pourcentage;
    //  progression.dateDerniereActivite = new Date();

      if (pourcentage === 100) {
        progression.dateFin = new Date();
        progression.statut = StatutProgression.COMPLETE;
      } else {
        progression.statut = StatutProgression.EN_COURS;
      }

      await progression.save();
      return progression;
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour de la progression :', err);
      throw err;
    }
  }

  /**
   * 🔹 Récupère une progression spécifique d’un apprenant dans un cours.
   */
  static async getByUserAndCourse(
    apprenantId: string | Types.ObjectId,
    coursId: string | Types.ObjectId
  ): Promise<IProgression | IProgressionDefault> {
    try {
      if (!Types.ObjectId.isValid(apprenantId) || !Types.ObjectId.isValid(coursId)) {
        console.warn(`Identifiant invalide: apprenantId=${apprenantId}, coursId=${coursId}`);
        return {
          apprenant: apprenantId.toString(),
          cours: coursId.toString(),
          pourcentage: 0,
          dateDebut: null,
          dateDerniereActivite: null,
          dateFin: null,
          statut: StatutProgression.EN_COURS,
        };
      }

      const progression = await Progression.findOne({
        apprenant: apprenantId,
        cours: coursId,
      }).populate('cours', 'titre niveau');

      if (!progression) {
        console.log(`Aucune progression trouvée pour apprenant ${apprenantId} et cours ${coursId}, retour de la progression par défaut`);
        return {
          apprenant: apprenantId.toString(),
          cours: coursId.toString(),
          pourcentage: 0,
          dateDebut: null,
          dateDerniereActivite: null,
          dateFin: null,
          statut: StatutProgression.EN_COURS,
        };
      }

      return progression;
    } catch (err) {
      console.error('❌ Erreur dans getByUserAndCourse :', err);
      throw err;
    }
  }

  /**
   * 🔹 Récupère toutes les progressions d’un apprenant.
   */
  static async getUserProgressions(
    apprenantId: string | Types.ObjectId
  ): Promise<IProgression[]> {
    try {
      if (!Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d’apprenant invalide');
      }

      const progressions = await Progression.find({ apprenant: apprenantId }).populate(
        'cours',
        'titre niveau domaine'
      );
      return progressions;
    } catch (err) {
      console.error('❌ Erreur dans getUserProgressions :', err);
      throw err;
    }
  }

  /**
   * 🔹 Récupère toutes les progressions (administration).
   */
  static async getAllProgressions(): Promise<IProgression[]> {
    try {
      const progressions = await Progression.find()
        .populate('apprenant', 'nom prenom')
        .populate('cours', 'titre');
      return progressions;
    } catch (err) {
      console.error('❌ Erreur dans getAllProgressions :', err);
      throw err;
    }
  }

  /**
   * 🔹 Récupère la progression globale d’un apprenant :
   *    - Moyenne de pourcentage sur tous ses cours
   *    - Nombre total de cours
   *    - Détails par cours
   */
  static async getGlobalProgress(
    apprenantId: string | Types.ObjectId
  ): Promise<{
    totalCours: number;
    moyennePourcentage: number;
    details: IProgression[];
  }> {
    try {
      if (!Types.ObjectId.isValid(apprenantId)) {
        throw new Error('Identifiant d’apprenant invalide');
      }

      const progressions = await Progression.find({ apprenant: apprenantId }).populate(
        'cours',
        'titre niveau'
      );

      if (!progressions || progressions.length === 0) {
        return { totalCours: 0, moyennePourcentage: 0, details: [] };
      }

      const totalCours = progressions.length;
      const totalPourcentage = progressions.reduce(
        (somme, prog) => somme + (prog.pourcentage || 0),
        0
      );

      const moyennePourcentage = Math.round(totalPourcentage / totalCours);

      return { totalCours, moyennePourcentage, details: progressions };
    } catch (err) {
      console.error('❌ Erreur dans getGlobalProgress :', err);
      throw err;
    }
  }
}

export default ProgressionService;