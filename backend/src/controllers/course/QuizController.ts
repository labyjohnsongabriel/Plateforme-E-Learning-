import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import Quiz from '../../models/course/Quiz';
import Cours from '../../models/course/Cours';
import Question from '../../models/course/Question';
import { QuizData, ReponseData } from '../../types';

class QuizService {
  static async create(data: QuizData) {
    const quiz = new Quiz(data);
    await quiz.save();

    await Cours.findByIdAndUpdate(data.cours, { $push: { quizzes: quiz._id } });

    // ✅ Pas besoin de caster en QuizDocument
    return quiz.toObject();
  }

  static async getAll() {
    const quizzes = await Quiz.find().populate('cours questions').lean();
    return quizzes;
  }

  static async getById(id: string) {
    const quiz = await Quiz.findById(id).populate('cours questions').lean();
    if (!quiz) throw createError(404, 'Quiz non trouvé');
    return quiz;
  }

  static async update(id: string, data: Partial<QuizData>) {
    const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!quiz) throw createError(404, 'Quiz non trouvé');
    return quiz;
  }

  static async delete(id: string) {
    const quiz = await Quiz.findByIdAndDelete(id).lean();
    if (!quiz) throw createError(404, 'Quiz non trouvé');
    await Question.deleteMany({ quiz: id });
    return quiz;
  }

  static async soumettre(id: string, reponses: ReponseData) {
    const quiz = await Quiz.findById(id);
    if (!quiz) throw createError(404, 'Quiz non trouvé');

    // 🟢 Ici on convertit proprement en tableau de nombres
    const parsedReponses: number[] = Array.isArray(reponses)
      ? reponses
      : Object.values(reponses).map((r) => Number(r));

    const result: any = await (quiz as any).corriger(parsedReponses);

    return {
      valide: result.valide,
      score: result.score,
    };
  }
}

class QuizController {
  static create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizService.create(req.body);
      res.status(201).json(quiz);
    } catch (err) {
      next(err);
    }
  };

  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quizzes = await QuizService.getAll();
      res.json(quizzes);
    } catch (err) {
      next(err);
    }
  };

  static getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizService.getById(req.params.id);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  };

  static update = async (req: Request<{ id: string }, {}, Partial<QuizData>>, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizService.update(req.params.id, req.body);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  };

  static delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizService.delete(req.params.id);
      res.json({ message: 'Quiz supprimé', quiz });
    } catch (err) {
      next(err);
    }
  };

  static soumettre = async (req: Request<{ id: string }, {}, { reponses: ReponseData }>, res: Response, next: NextFunction) => {
    try {
      const resultat = await QuizService.soumettre(req.params.id, req.body.reponses);
      res.json(resultat);
    } catch (err) {
      next(err);
    }
  };
}

export default QuizController;
