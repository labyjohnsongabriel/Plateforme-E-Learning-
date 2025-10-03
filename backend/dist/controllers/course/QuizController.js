"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Quiz_1 = require("../../models/course/Quiz");
const Cours_1 = require("../../models/course/Cours");
const Question_1 = require("../../models/course/Question");
const Progression_1 = require("../../models/course/Progression");
const types_1 = require("../../types");
class QuizService {
    /**
     * Crée un nouveau quiz et l'associe à un cours.
     * @param data - Données du quiz
     * @returns Le quiz créé
     */
    static async create(data) {
        const quiz = new Quiz_1.Quiz(data);
        await quiz.save();
        // Ajouter au cours
        await Cours_1.Cours.findByIdAndUpdate(data.cours, { $push: { quizzes: quiz._id } });
        return quiz;
    }
    /**
     * Récupère tous les quizzes avec leurs cours et questions associés.
     * @returns Liste des quizzes
     */
    static async getAll() {
        return Quiz_1.Quiz.find().populate('cours questions');
    }
    /**
     * Récupère un quiz par son ID.
     * @param id - ID du quiz
     * @returns Le quiz trouvé
     * @throws Error si le quiz n'existe pas
     */
    static async getById(id) {
        const quiz = await Quiz_1.Quiz.findById(id).populate('cours questions');
        if (!quiz) {
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
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
    static async update(id, data) {
        const quiz = await Quiz_1.Quiz.findByIdAndUpdate(id, data, { new: true });
        if (!quiz) {
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        }
        return quiz;
    }
    /**
     * Supprime un quiz et ses questions associées.
     * @param id - ID du quiz
     * @returns Le quiz supprimé
     * @throws Error si le quiz n'existe pas
     */
    static async delete(id) {
        const quiz = await Quiz_1.Quiz.findByIdAndDelete(id);
        if (!quiz) {
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        }
        // Supprimer les questions associées
        await Question_1.Question.deleteMany({ quiz: id });
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
    static async soumettre(id, reponses, utilisateurId) {
        const quiz = await Quiz_1.Quiz.findById(id);
        if (!quiz) {
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        }
        const resultat = await quiz.corriger(reponses);
        // Mettre à jour progression
        await Progression_1.Progression.updateOne({ utilisateur: utilisateurId, cours: quiz.cours }, { $inc: { avancement: resultat.valide ? 20 : 10 } });
        return resultat;
    }
}
class QuizController {
}
_a = QuizController;
/**
 * Crée un nouveau quiz.
 * @param req - Requête Express avec corps
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
QuizController.create = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const quiz = await QuizService.create(req.body);
        res.status(201).json(quiz);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère tous les quizzes.
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
QuizController.getAll = async (req, res, next) => {
    try {
        const quizzes = await QuizService.getAll();
        res.json(quizzes);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Récupère un quiz par son ID.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
QuizController.getById = async (req, res, next) => {
    try {
        const quiz = await QuizService.getById(req.params.id);
        res.json(quiz);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Met à jour un quiz.
 * @param req - Requête Express avec paramètre ID et corps
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
QuizController.update = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const quiz = await QuizService.update(req.params.id, req.body);
        res.json(quiz);
    }
    catch (err) {
        next(err);
    }
};
/**
 * Supprime un quiz.
 * @param req - Requête Express avec paramètre ID
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
QuizController.delete = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const quiz = await QuizService.delete(req.params.id);
        res.json({ message: 'Quiz supprimé' });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Soumet des réponses à un quiz.
 * @param req - Requête Express avec paramètre ID et réponses
 * @param res - Réponse Express
 * @param next - Fonction middleware suivante
 */
QuizController.soumettre = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const resultat = await QuizService.soumettre(req.params.id, req.body.reponses, req.user.id);
        res.json(resultat);
    }
    catch (err) {
        next(err);
    }
};
exports.default = QuizController;
//# sourceMappingURL=QuizController.js.map