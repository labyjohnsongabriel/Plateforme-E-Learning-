// src/services/course/ContenuService.ts - CORRIGÉ
import createError from 'http-errors';
import mongoose from 'mongoose';
import Contenu from '../../models/course/Contenu';
import Cours from '../../models/course/Cours';
import { ContenuData } from '../../types';
import logger from '../../utils/logger';

// Interface améliorée pour les documents .lean()
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
  // Ajout des champs manquants pour la compatibilité
  contenu?: string;
  filePath?: string;
  size?: number;
}

export class ContenuService {
  /**
   * Créer un contenu
   */
  static async create(data: ContenuData): Promise<LeanContenuDocument> {
    try {
      // Validation de l'ID du cours
      if (!mongoose.Types.ObjectId.isValid(data.cours)) {
        throw createError(400, `ID de cours invalide: ${data.cours}`);
      }

      // Vérification que le cours existe
      const coursExists = await Cours.findById(data.cours);
      if (!coursExists) {
        throw createError(404, `Cours non trouvé: ${data.cours}`);
      }

      // Validation du type de contenu
      const validTypes = ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'];
      if (!validTypes.includes(data.type)) {
        throw createError(400, `Type de contenu invalide. Types acceptés: ${validTypes.join(', ')}`);
      }

      const contenu = new Contenu(data);
      await contenu.save();

      logger.info(`Contenu créé avec succès: ${contenu._id} (${contenu.type}) pour le cours ${data.cours}`);
      return contenu.toObject() as LeanContenuDocument;
    } catch (err) {
      logger.error(`Erreur création contenu: ${(err as Error).message}`, { data });
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
        .sort({ ordre: 1, createdAt: -1 })
        .lean();
      
      logger.info(`Récupération de ${contenus.length} contenus`);
      return contenus as LeanContenuDocument[];
    } catch (err) {
      logger.error(`Erreur getAll contenus: ${(err as Error).message}`);
      throw createError(500, 'Erreur serveur lors de la récupération des contenus');
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

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createError(400, `ID utilisateur invalide: ${userId}`);
      }

      const course = await Cours.findById(courseId).select('titre description');
      if (!course) {
        logger.warn(`Tentative d'accès à un cours non existant: ${courseId}`);
        throw createError(404, 'Cours non trouvé');
      }

      let contenus = await Contenu.find({ cours: courseId })
        .populate('cours', 'titre description')
        .sort({ ordre: 1, createdAt: 1 })
        .lean() as LeanContenuDocument[];

      // Ajout du statut isCompleted par utilisateur
      contenus = contenus.map(contenu => ({
        ...contenu,
        isCompleted: contenu.completedBy?.some(id => id.toString() === userId) || false,
      }));

      logger.info(`Récupéré ${contenus.length} contenus pour le cours ${courseId} (utilisateur: ${userId})`);
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

      // Validation du type si fourni
      if (data.type) {
        const validTypes = ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'];
        if (!validTypes.includes(data.type)) {
          throw createError(400, `Type de contenu invalide. Types acceptés: ${validTypes.join(', ')}`);
        }
      }

      const contenu = await Contenu.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      )
        .populate('cours', 'titre description')
        .lean();

      if (!contenu) throw createError(404, 'Contenu non trouvé');

      logger.info(`Contenu mis à jour avec succès: ${id}`);
      return contenu as LeanContenuDocument;
    } catch (err) {
      logger.error(`Erreur update ${id}: ${(err as Error).message}`, { data });
      throw err;
    }
  }

  /**
   * Supprimer un contenu
   */
  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      const contenu = await Contenu.findByIdAndDelete(id).lean();
      if (!contenu) throw createError(404, 'Contenu non trouvé');

      logger.info(`Contenu supprimé avec succès: ${id}`);
      return {
        success: true,
        message: 'Contenu supprimé avec succès'
      };
    } catch (err) {
      logger.error(`Erreur delete ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Marquer un contenu comme complété (user-specific)
   */
  static async complete(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createError(400, `ID utilisateur invalide: ${userId}`);
      }

      const contenu = await Contenu.findByIdAndUpdate(
        id,
        { $addToSet: { completedBy: userId } },
        { new: true }
      );

      if (!contenu) throw createError(404, 'Contenu non trouvé');

      logger.info(`Contenu complété par user ${userId}: ${id}`);
      return {
        success: true,
        message: 'Contenu marqué comme complété'
      };
    } catch (err) {
      logger.error(`Erreur complete ${id}: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Soumettre un quiz
   */
  static async soumettre(id: string, answers: any[], userId: string): Promise<{ 
    success: boolean; 
    message: string;
    score?: number;
    isPassed?: boolean;
  }> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, `ID de contenu invalide: ${id}`);
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createError(400, `ID utilisateur invalide: ${userId}`);
      }

      const contenu = await Contenu.findById(id);
      if (!contenu) throw createError(404, 'Contenu non trouvé');
      if (contenu.type !== 'QUIZ') throw createError(400, 'Ce contenu n\'est pas un quiz');

      // Logique de validation du quiz (exemple simple)
      // À adapter selon votre structure de quiz
      const score = this.calculateQuizScore(answers);
      const isPassed = score >= 70; // 70% pour réussir

      if (isPassed) {
        await this.complete(id, userId);
      }

      logger.info(`Quiz soumis pour contenu ${id} par user ${userId}. Score: ${score}%, Réussi: ${isPassed}`);
      
      return { 
        success: true, 
        message: 'Quiz soumis avec succès',
        score,
        isPassed
      };
    } catch (err) {
      logger.error(`Erreur soumettre ${id}: ${(err as Error).message}`, { answers });
      throw err;
    }
  }

  /**
   * Calculer le score d'un quiz (méthode d'exemple)
   */
  private static calculateQuizScore(answers: any[]): number {
    // Implémentation basique - à adapter selon votre logique métier
    if (!answers || answers.length === 0) return 0;
    
    const correctAnswers = answers.filter(answer => 
      answer.isCorrect === true || answer.correct === true
    ).length;
    
    return Math.round((correctAnswers / answers.length) * 100);
  }
}