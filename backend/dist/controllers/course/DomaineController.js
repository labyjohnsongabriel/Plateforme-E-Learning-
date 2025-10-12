"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
const Domaine_1 = __importDefault(require("../../models/course/Domaine"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const logger_1 = __importDefault(require("../../utils/logger"));
class DomaineService {
    static async create(data) {
        try {
            const domaine = new Domaine_1.default(data);
            await domaine.save();
            return domaine.toObject();
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la création du domaine : ${err.message}`);
            throw err;
        }
    }
    static async getAll() {
        try {
            const domaines = await Domaine_1.default.find().exec();
            return domaines.map((doc) => doc.toObject());
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la récupération des domaines : ${err.message}`);
            throw err;
        }
    }
    static async getById(id) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw (0, http_errors_1.default)(400, 'ID invalide');
            }
            const domaine = await Domaine_1.default.findById(id).exec();
            if (!domaine) {
                throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
            }
            return domaine.toObject();
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la récupération du domaine : ${err.message}`);
            throw err;
        }
    }
    static async update(id, data) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw (0, http_errors_1.default)(400, 'ID invalide');
            }
            const domaine = await Domaine_1.default.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).exec();
            if (!domaine) {
                throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
            }
            return domaine.toObject();
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la mise à jour du domaine : ${err.message}`);
            throw err;
        }
    }
    static async delete(id) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw (0, http_errors_1.default)(400, 'ID invalide');
            }
            const domaine = await Domaine_1.default.findByIdAndDelete(id).exec();
            if (!domaine) {
                throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
            }
            await Cours_1.default.deleteMany({ domaineId: id });
            return domaine.toObject();
        }
        catch (err) {
            logger_1.default.error(`Erreur lors de la suppression du domaine : ${err.message}`);
            throw err;
        }
    }
}
class DomaineController {
}
_a = DomaineController;
DomaineController.create = async (req, res, next) => {
    try {
        const domaine = await DomaineService.create(req.body);
        res.status(201).json(domaine);
    }
    catch (err) {
        next(err);
    }
};
DomaineController.getAll = async (req, res, next) => {
    try {
        const domaines = await DomaineService.getAll();
        res.json({ data: domaines });
    }
    catch (err) {
        next(err);
    }
};
DomaineController.getById = async (req, res, next) => {
    try {
        const domaine = await DomaineService.getById(req.params.id);
        res.json(domaine);
    }
    catch (err) {
        next(err);
    }
};
DomaineController.update = async (req, res, next) => {
    try {
        const domaine = await DomaineService.update(req.params.id, req.body);
        res.json(domaine);
    }
    catch (err) {
        next(err);
    }
};
DomaineController.delete = async (req, res, next) => {
    try {
        const domaine = await DomaineService.delete(req.params.id);
        res.json({ message: 'Domaine supprimé avec succès', domaine });
    }
    catch (err) {
        next(err);
    }
};
exports.default = DomaineController;
//# sourceMappingURL=DomaineController.js.map