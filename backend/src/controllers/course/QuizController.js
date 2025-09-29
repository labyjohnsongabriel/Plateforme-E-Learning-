const createError = require("http-errors");
const Quiz = require("../../models/course/Quiz");
const Cours = require("../../models/course/Cours");
const Question = require("../../models/course/Question"); // Add this
const mongoose = require("mongoose");

class QuizService {
  static async create(data) {
    const quiz = new Quiz(data);
    await quiz.save();
    // Ajouter au cours
    await Cours.findByIdAndUpdate(data.cours, { $push: { quizzes: quiz._id } });
    return quiz;
  }

  static async getAll() {
    return Quiz.find().populate("cours questions");
  }

  static async getById(id) {
    const quiz = await Quiz.findById(id).populate("cours questions");
    if (!quiz) throw createError(404, "Quiz non trouvé");
    return quiz;
  }

  static async update(id, data) {
    const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true });
    if (!quiz) throw createError(404, "Quiz non trouvé");
    return quiz;
  }

  static async delete(id) {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) throw createError(404, "Quiz non trouvé");
    // Supprimer les questions associées
    await Question.deleteMany({ quiz: id });
    return quiz;
  }

  static async soumettre(id, reponses, utilisateurId) {
    const quiz = await Quiz.findById(id);
    if (!quiz) throw createError(404, "Quiz non trouvé");
    const resultat = await quiz.corriger(reponses);
    // Mettre à jour progression
    const Progression = require("../../models/course/Progression"); // Explicit import
    await Progression.updateOne(
      { utilisateur: utilisateurId, cours: quiz.cours },
      { $inc: { avancement: resultat.valide ? 20 : 10 } }
    );
    return resultat;
  }
}

module.exports = {
  create: async (req, res, next) => {
    try {
      const quiz = await QuizService.create(req.body);
      res.status(201).json(quiz);
    } catch (err) {
      next(err);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const quizzes = await QuizService.getAll();
      res.json(quizzes);
    } catch (err) {
      next(err);
    }
  },
  getById: async (req, res, next) => {
    try {
      const quiz = await QuizService.getById(req.params.id);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const quiz = await QuizService.update(req.params.id, req.body);
      res.json(quiz);
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const quiz = await QuizService.delete(req.params.id);
      res.json({ message: "Quiz supprimé" });
    } catch (err) {
      next(err);
    }
  },
  soumettre: async (req, res, next) => {
    try {
      const resultat = await QuizService.soumettre(
        req.params.id,
        req.body.reponses,
        req.user.id
      );
      res.json(resultat);
    } catch (err) {
      next(err);
    }
  },
};
