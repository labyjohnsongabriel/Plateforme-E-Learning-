import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { Quiz } from '../../models/course/Quiz';
import { Cours } from '../../models/course/Cours';
import { Question } from '../../models/course/Question';
import { Progression } from '../../models/course/Progression';
import { QuizDocument, QuizData, ReponseData } from '../../types';

class QuizService {
  /**
   * Crée un nouveau quiz et l'associe à un cours.
   * @param data - Données du quiz
   * @returns Le quiz créé
   */
  static async create(data: QuizData): Promise<QuizDocument> {
    const quiz = new Quiz(data);
    await quiz.save();
    // Ajouter au cours
    await Cours.findByIdAndUpdate(data.cours, { $push: { quizzes: quiz._id } });
    return quiz;
  }

  /**
   * Récupère tous les quizzes avec leurs cours et questions associés.
   * @returns Liste des quizzes
   */
  static async getAll(): Promise<QuizDocument[]> {
    return Quiz.find().populate('cours questions');
  }

  /**
   * Récupère un quiz par son ID.
   * @param id - ID du quiz
   * @returns Le quiz trouvé
   * @throws Error si le quiz n'existe pas
   */
  static async getById(id: string): Promise<QuizDocument> {
    const quiz = await Quiz.findById(id).populate('cours questions');
    if (!quiz) {
      throw createError(404, 'Quiz non trouvé');
    }
    return quiz;
  }

  /**
   * Met à jour un quiz.
   * @param id - ID du quiz
   * @param data - Données à mettre à jour
   * @returns Le quiz mis à jour
   * @throws Error si le quiz n'existe pas
   */
  static async update(id: string, data: Partial<QuizData>): Promise<QuizDocument> {
    const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true });
    if (!quiz) {
      throw createError(404, 'Quiz non trouvé');
    }
    return quiz;
  }

  /**
   * Supprime un quiz et ses questions associées.
   * @param id - ID du quiz
   * @returns Le quiz supprimé
   * @throws Error si le quiz n'existe pas
   */
  static async delete(id: string): Promise<QuizDocument> {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      throw createError(404, 'Quiz non trouvé');
    }
    // Supprimer les questions associées
    await Question.deleteMany({ quiz: id });
    return quiz;
  }

  /**
   * Soumet des réponses à un quiz et met à jour la progression.
   * @param id - ID du quiz
   * @param reponses - Réponses de l'utilisateur
   * @param utilisateurId - ID de l'utilisateur
   * @returns Résultat de la correction
   * @throws Error si le quiz n'existe pas
   */
  static async soumettre(id: string, reponses: ReponseData, utilisateurId: string): Promise<{ valide: boolean; score: number }> {
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw createError(404, 'Quiz non trouvé');
    }
    const resultat = await quiz.corriger(reponses);
    // Mettre à jour progression
    await Progression.updateOne(
      { utilisateur: utilisateurId, cours: quiz.cours },
      { $inc: { avancement: resultat.valide ? 20 : 10 } }
    );
    return resultat;
  }
}

class QuizController {
  /**
   * Crée un nouveau quiz.
   * @param req - Requête Express avec corps
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static create = async (req: Request<{}, {}, QuizData>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const quiz = await QuizService.create(req.body);
      res.status(201).json(quiz);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère tous les quizzes.
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizzes = await QuizService.getAll();
      res.json(quizzes);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Récupère un quiz par son ID.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quiz = await QuizService.getById(req.params.id);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Met à jour un quiz.
   * @param req - Requête Express avec paramètre ID et corps
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static update = async (req: Request<{ id: string }, {}, Partial<QuizData>>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const quiz = await QuizService.update(req.params.id, req.body);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Supprime un quiz.
   * @param req - Requête Express avec paramètre ID
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const quiz = await QuizService.delete(req.params.id);
      res.json({ message: 'Quiz supprimé' });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Soumet des réponses à un quiz.
   * @param req - Requête Express avec paramètre ID et réponses
   * @param res - Réponse Express
   * @param next - Fonction middleware suivante
   */
  static soumettre = async (req: Request<{ id: string }, {}, { reponses: ReponseData }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        throw createError(401, 'Utilisateur non authentifié');
      }
      const resultat = await QuizService.soumettre(req.params.id, req.body.reponses, req.user.id);
      res.json(resultat);
    } catch (err) {
      next(err);
    }
  };
}

export default QuizController;