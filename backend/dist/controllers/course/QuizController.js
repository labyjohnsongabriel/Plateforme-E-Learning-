"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const Quiz_1 = __importDefault(require("../../models/course/Quiz"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const Question_1 = __importDefault(require("../../models/course/Question"));
class QuizService {
    static async create(data) {
        const quiz = new Quiz_1.default(data);
        await quiz.save();
        await Cours_1.default.findByIdAndUpdate(data.cours, { $push: { quizzes: quiz._id } });
        // ✅ Pas besoin de caster en QuizDocument
        return quiz.toObject();
    }
    static async getAll() {
        const quizzes = await Quiz_1.default.find().populate('cours questions').lean();
        return quizzes;
    }
    static async getById(id) {
        const quiz = await Quiz_1.default.findById(id).populate('cours questions').lean();
        if (!quiz)
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        return quiz;
    }
    static async update(id, data) {
        const quiz = await Quiz_1.default.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!quiz)
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        return quiz;
    }
    static async delete(id) {
        const quiz = await Quiz_1.default.findByIdAndDelete(id).lean();
        if (!quiz)
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        await Question_1.default.deleteMany({ quiz: id });
        return quiz;
    }
    static async soumettre(id, reponses) {
        const quiz = await Quiz_1.default.findById(id);
        if (!quiz)
            throw (0, http_errors_1.default)(404, 'Quiz non trouvé');
        // 🟢 Ici on convertit proprement en tableau de nombres
        const parsedReponses = Array.isArray(reponses)
            ? reponses
            : Object.values(reponses).map((r) => Number(r));
        const result = await quiz.corriger(parsedReponses);
        return {
            valide: result.valide,
            score: result.score,
        };
    }
}
class QuizController {
}
_a = QuizController;
QuizController.create = async (req, res, next) => {
    try {
        const quiz = await QuizService.create(req.body);
        res.status(201).json(quiz);
    }
    catch (err) {
        next(err);
    }
};
QuizController.getAll = async (req, res, next) => {
    try {
        const quizzes = await QuizService.getAll();
        res.json(quizzes);
    }
    catch (err) {
        next(err);
    }
};
QuizController.getById = async (req, res, next) => {
    try {
        const quiz = await QuizService.getById(req.params.id);
        res.json(quiz);
    }
    catch (err) {
        next(err);
    }
};
QuizController.update = async (req, res, next) => {
    try {
        const quiz = await QuizService.update(req.params.id, req.body);
        res.json(quiz);
    }
    catch (err) {
        next(err);
    }
};
QuizController.delete = async (req, res, next) => {
    try {
        const quiz = await QuizService.delete(req.params.id);
        res.json({ message: 'Quiz supprimé', quiz });
    }
    catch (err) {
        next(err);
    }
};
QuizController.soumettre = async (req, res, next) => {
    try {
        const resultat = await QuizService.soumettre(req.params.id, req.body.reponses);
        res.json(resultat);
    }
    catch (err) {
        next(err);
    }
};
exports.default = QuizController;
//# sourceMappingURL=QuizController.js.map