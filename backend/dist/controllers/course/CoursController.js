"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const Domaine_1 = __importDefault(require("../../models/course/Domaine"));
const Contenu_1 = __importDefault(require("../../models/course/Contenu"));
const Quiz_1 = __importDefault(require("../../models/course/Quiz"));
const logger_1 = __importDefault(require("../../utils/logger"));
class CoursService {
    static async create(data, createurId) {
        try {
            // Vérification du domaine
            const domaine = await Domaine_1.default.findById(data.domaineId);
            if (!domaine) {
                throw (0, http_errors_1.default)(400, 'Domaine non trouvé');
            }
            const cours = new Cours_1.default({
                ...data,
                createur: createurId,
                domaineId: data.domaineId,
            });
            await cours.save();
            // Ajout du cours dans le domaine correspondant
            await Domaine_1.default.findByIdAndUpdate(data.domaineId, {
                $push: { cours: cours._id },
            });
            return cours;
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la création du cours: ${err.message}`);
            throw err;
        }
    }
    static async getAll(page = 1, limit = 10) {
        try {
            const courses = await Cours_1.default.find()
                .populate('domaineId')
                .limit(limit)
                .skip((page - 1) * limit)
                .lean(); // Keep .lean() for performance
            const total = await Cours_1.default.countDocuments();
            return {
                data: courses, // ✅ Safe cast through unknown
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            };
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la récupération des cours: ${err.message}`);
            throw (0, http_errors_1.default)(500, `Erreur serveur: ${err.message}`);
        }
    }
    static async getById(id) {
        try {
            const cours = await Cours_1.default.findById(id).populate('domaineId').lean();
            if (!cours) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            return cours; // ✅ Safe cast through unknown
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la récupération du cours: ${err.message}`);
            throw err;
        }
    }
    static async update(id, data) {
        try {
            if (data.domaineId) {
                const domaine = await Domaine_1.default.findById(data.domaineId);
                if (!domaine) {
                    throw (0, http_errors_1.default)(400, 'Domaine non trouvé');
                }
            }
            const cours = await Cours_1.default.findByIdAndUpdate(id, { ...data, domaineId: data.domaineId }, { new: true, runValidators: true }).lean();
            if (!cours) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            return cours; // ✅ Safe cast through unknown
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la mise à jour du cours: ${err.message}`);
            throw err;
        }
    }
    static async delete(id) {
        try {
            const cours = await Cours_1.default.findByIdAndDelete(id).lean();
            if (!cours) {
                throw (0, http_errors_1.default)(404, 'Cours non trouvé');
            }
            await Contenu_1.default.deleteMany({ cours: id });
            await Quiz_1.default.deleteMany({ cours: id });
            await Domaine_1.default.findByIdAndUpdate(cours.domaineId, { $pull: { cours: id } });
            return cours; // ✅ Safe cast through unknown
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la suppression du cours: ${err.message}`);
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