// src/services/learning/ProgressionService.ts
import { Types } from 'mongoose';
import Progression, { IProgression } from '../../models/learning/Progression';
import Cours, { ICours } from '../../models/course/Cours';

export enum StatutProgression {
  EN_COURS = 'EN_COURS',
  COMPLETE = 'COMPLETE',
}

export class ProgressionService {
  static async initialize(
    apprenantId: string | Types.ObjectId,
    coursId: string | Types.ObjectId
  ): Promise<IProgression> {
    try {
      const existing = await Progression.findOne({ apprenant: apprenantId, cours: coursId });
      if (existing) {
        return existing;
      }

      const cours = await Cours.findById(coursId);
      if (!cours) {
        throw new Error('Cours non trouvé');
      }

      const progression = new Progression({
        apprenant: apprenantId,
        cours: coursId,
        dateDebut: new Date(),
      });
      await progression.save();
      return progression;
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la progression:', err);
      throw err;
    }
  }

  static async update(
    apprenantId: string | Types.ObjectId,
    coursId: string | Types.ObjectId,
    pourcentage: number
  ): Promise<IProgression> {
    try {
      if (pourcentage < 0 || pourcentage > 100) {
        throw new Error('Pourcentage invalide (doit être entre 0 et 100)');
      }

      const progression = await Progression.findOne({ apprenant: apprenantId, cours: coursId });
      if (!progression) {
        throw new Error('Progression non trouvée');
      }

      progression.pourcentage = pourcentage;
      if (pourcentage === 100) {
        progression.dateFin = new Date();
        progression.statut = StatutProgression.COMPLETE;
      } else if (pourcentage > 0 && progression.statut === StatutProgression.EN_COURS) {
        // Optional logic
      }

      await progression.save();
      return progression;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la progression:', err);
      throw err;
    }
  }

  static async getByUserAndCourse(
    apprenantId: string | Types.ObjectId,
    coursId: string | Types.ObjectId
  ): Promise<IProgression> {
    try {
      const progression = await Progression.findOne({ apprenant: apprenantId, cours: coursId }).populate('cours', 'titre niveau');
      if (!progression) {
        throw new Error('Progression non trouvée');
      }
      return progression;
    } catch (err) {
      throw err;
    }
  }

  static async getUserProgressions(apprenantId: string | Types.ObjectId): Promise<IProgression[]> {
    try {
      const progressions = await Progression.find({ apprenant: apprenantId }).populate('cours', 'titre niveau domaine');
      return progressions;
    } catch (err) {
      throw err;
    }
  }

  static async getAllProgressions(): Promise<IProgression[]> {
    try {
      const progressions = await Progression.find()
        .populate('apprenant', 'nom prenom')
        .populate('cours', 'titre');
      return progressions;
    } catch (err) {
      throw err;
    }
  }
}

export default ProgressionService;