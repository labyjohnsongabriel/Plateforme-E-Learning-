"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const Cours_1 = require("../../models/course/Cours");
const Domaine_1 = require("../../models/course/Domaine");
const Contenu_1 = require("../../models/course/Contenu");
const Quiz_1 = require("../../models/course/Quiz");
const logger_1 = __importDefault(require("../../utils/logger"));
class CoursService {
    static async create(data, createurId) {
        try {
            // Verify domaineId exists
            const domaine = await Domaine_1.Domaine.findById(data.domaineId);
            if (!domaine) {
                throw (0, http_errors_1.default)(400, 'Domaine non trouvé');
            }
            const cours = new Cours_1.Cours({
                ...data,
                createur: createurId,
                domaineId: data.domaineId,
            });
            await cours.save();
            // Add course to domaine
            await Domaine_1.Domaine.findByIdAndUpdate(data.domaineId, {
                $push: { cours: cours._id },
            });
            return cours;
        }
        catch (err) {
            logger_1.default.error(`Error creating course: ${err.message}`);
            throw err;
        }
    }
    static async getAll(page = 1, limit = 10) {
        try {
            const courses = await Cours_1.Cours.find()
                .populate('domaineId')
                .limit(limit)
                .skip((page - 1) * limit)
                .lean();
            const total = await Cours_1.Cours.countDocuments();
            return {
                data: courses,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            };
        }
        catch (err) {
            logger_1.default.error(`Error fetching courses: ${err.message}`);
            throw (0, http_errors_1.default)(500, `Error fetching courses: ${err.message}`);
        }
    }
    static async getById(id) {
        try {
            const cours = await Cours_1.Cours.findById(id).populate('domaineId').lean();
            if (!cours) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            return cours;
        }
        catch (err) {
            logger_1.default.error(`Error fetching course by ID: ${err.message}`);
            throw err;
        }
    }
    static async update(id, data) {
        try {
            // Verify domaineId exists if provided
            if (data.domaineId) {
                const domaine = await Domaine_1.Domaine.findById(data.domaineId);
                if (!domaine) {
                    throw (0, http_errors_1.default)(400, 'Domaine non trouvé');
                }
            }
            const cours = await Cours_1.Cours.findByIdAndUpdate(id, { ...data, domaineId: data.domaineId }, { new: true, runValidators: true });
            if (!cours) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            return cours;
        }
        catch (err) {
            logger_1.default.error(`Error updating course: ${err.message}`);
            throw err;
        }
    }
    static async delete(id) {
        try {
            const cours = await Cours_1.Cours.findByIdAndDelete(id);
            if (!cours) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            // Delete associated contenus and quizzes
            await Contenu_1.Contenu.deleteMany({ cours: id });
            await Quiz_1.Quiz.deleteMany({ cours: id });
            // Remove course from domaine
            await Domaine_1.Domaine.findByIdAndUpdate(cours.domaineId, {
                $pull: { cours: id },
            });
            return cours;
        }
        catch (err) {
            logger_1.default.error(`Error deleting course: ${err.message}`);
            throw err;
        }
    }
}
class CoursController {
}
_a = CoursController;
CoursController.create = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        }
        const cours = await CoursService.create(req.body, req.user.id);
        res.status(201).json(cours);
    }
    catch (err) {
        next(err);
    }
};
CoursController.getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const cours = await CoursService.getAll(page, limit);
        res.json(cours);
    }
    catch (err) {
        next(err);
    }
};
CoursController.getById = async (req, res, next) => {
    try {
        const cours = await CoursService.getById(req.params.id);
        res.json(cours);
    }
    catch (err) {
        next(err);
    }
};
CoursController.update = async (req, res, next) => {
    try {
        const cours = await CoursService.update(req.params.id, req.body);
        res.json(cours);
    }
    catch (err) {
        next(err);
    }
};
CoursController.delete = async (req, res, next) => {
    try {
        const cours = await CoursService.delete(req.params.id);
        res.json({ message: 'Cours supprimé', cours });
    }
    catch (err) {
        next(err);
    }
};
exports.default = CoursController;
//# sourceMappingURL=CoursController.js.map