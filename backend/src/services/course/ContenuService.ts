// src/services/course/ContenuService.ts
import createError from 'http-errors';
import mongoose from 'mongoose';
import Contenu from '../../models/course/Contenu';
import Cours from '../../models/course/Cours';
import { ContenuData } from '../../types';
import logger from '../../utils/logger';

// Type strict pour les documents .lean()
interface LeanContenuDocument {
  _id: mongoose.Types.ObjectId;
  titre: string;
  description?: string;
  type: 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'EXERCICE';
  url: string;
  duree?: number;
  ordre: number;
  cours: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; titre: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  isCompleted?: boolean;
  completedBy?: mongoose.Types.ObjectId[];
}

export class ContenuService {
  /**
   * Créer un contenu
   */
  static async create(data: ContenuData): Promise<LeanContenuDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(data.cours)) {
        throw createError(400, `ID de cours invalide: ${data.cours}`);
      }

      const contenu = new Contenu(data);
      await contenu.save();

      // CORRIGÉ : Plus de $push sur Cours.contenu (champ imbriqué, pas tableau)
      logger.info(`Contenu créé: ${contenu._id} (${contenu.type})`);
      return contenu.toObject() as LeanContenuDocument;
    } catch (err) {
      logger.error(`Erreur création contenu: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Tous les contenus (admin)
   */
  static async getAll(): Promise<LeanContenuDocument[]> {
    try {
      const contenus = await Contenu.find()
        .populate('cours', 'titre description')
        .sort({ ordre: 1 })
        .lean();
      return contenus as LeanContenuDocument[];
    } catch (err) {
      logger.error(`Erreur getAll contenus: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Un contenu par ID
   */
  static async getById(id: string): Promise<LeanContenuDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      const contenu = await Contenu.findById(id)
        .populate('cours', 'titre description')
        .lean();

      if (!contenu) throw createError(404, 'Contenu non trouvé');

      return contenu as LeanContenuDocument;
    } catch (err) {
      logger.error(`Erreur getById ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Tous les contenus d'un cours (avec isCompleted utilisateur)
   */
  static async getByCourseId(courseId: string, userId: string): Promise<LeanContenuDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw createError(400, `ID de cours invalide: ${courseId}`);
      }

      const course = await Cours.findById(courseId).select('titre description');
      if (!course) {
        logger.info(`Cours ${courseId} non trouvé → []`);
        return [];
      }

      let contenus = await Contenu.find({ cours: courseId })
        .populate('cours', 'titre description')
        .sort({ ordre: 1 })
        .lean() as LeanContenuDocument[];

      // Ajout du statut isCompleted par utilisateur
      contenus = contenus.map(contenu => ({
        ...contenu,
        isCompleted: contenu.completedBy?.some(id => id.toString() === userId) || false,
      }));

      logger.info(`Récupéré ${contenus.length} contenus pour le cours ${courseId}`);
      return contenus;
    } catch (err) {
      logger.error(`Erreur getByCourseId ${courseId}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Mettre à jour un contenu
   */
  static async update(id: string, data: Partial<ContenuData>): Promise<LeanContenuDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      const contenu = await Contenu.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      )
        .populate('cours', 'titre description')
        .lean();

      if (!contenu) throw createError(404, 'Contenu non trouvé');

      logger.info(`Contenu mis à jour: ${id}`);
      return contenu as LeanContenuDocument;
    } catch (err) {
      logger.error(`Erreur update ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Supprimer un contenu
   */
  static async delete(id: string): Promise<LeanContenuDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      const contenu = await Contenu.findByIdAndDelete(id).lean();
      if (!contenu) throw createError(404, 'Contenu non trouvé');

      // CORRIGÉ : Plus de $pull sur Cours.contenu
      logger.info(`Contenu supprimé: ${id}`);
      return contenu as LeanContenuDocument;
    } catch (err) {
      logger.error(`Erreur delete ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Marquer un contenu comme complété (user-specific)
   */
  static async complete(id: string, userId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      const contenu = await Contenu.findByIdAndUpdate(
        id,
        { $addToSet: { completedBy: userId } },
        { new: true }
      );

      if (!contenu) throw createError(404, 'Contenu non trouvé');

      logger.info(`Contenu complété par user ${userId}: ${id}`);
    } catch (err) {
      logger.error(`Erreur complete ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Soumettre un quiz
   */
  static async soumettre(id: string, answers: any[], userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      const contenu = await Contenu.findById(id);
      if (!contenu) throw createError(404, 'Contenu non trouvé');
      if (contenu.type !== 'QUIZ') throw createError(400, 'Ce contenu n\'est pas un quiz');

      // Logique de validation (exemple simple - à étendre)
      const success = answers.length > 0;

      if (success) {
        await this.complete(id, userId);
      }

      logger.info(`Quiz soumis pour contenu ${id} par user ${userId}`);
      return { success, message: success ? 'Quiz soumis avec succès' : 'Erreur dans les réponses' };
    } catch (err) {
      logger.error(`Erreur soumettre ${id}: ${(err as Error).message}`);
      throw err;
    }
  }
}