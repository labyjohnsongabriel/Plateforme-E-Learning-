"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const Contenu_1 = __importDefault(require("../../models/course/Contenu")); // ✅ Changed to default import
const Cours_1 = __importDefault(require("../../models/course/Cours")); // ✅ Changed to default import
class ContenuService {
    static async create(data, file) {
        if (file) {
            data.url = `/uploads/${file.filename}`;
        }
        const contenu = new Contenu_1.default(data);
        await contenu.save();
        // Ajouter au cours
        await Cours_1.default.findByIdAndUpdate(data.cours, {
            $push: { contenus: contenu._id },
        });
        return contenu;
    }
    static async getAll() {
        return Contenu_1.default.find().populate('cours');
    }
    static async getById(id) {
        const contenu = await Contenu_1.default.findById(id).populate('cours');
        if (!contenu) {
            throw (0, http_errors_1.default)(404, 'Contenu non trouvé');
        }
        return contenu;
    }
    static async update(id, data, file) {
        if (file) {
            data.url = `/uploads/${file.filename}`;
        }
        const contenu = await Contenu_1.default.findByIdAndUpdate(id, data, { new: true });
        if (!contenu) {
            throw (0, http_errors_1.default)(404, 'Contenu non trouvé');
        }
        return contenu;
    }
    static async delete(id) {
        const contenu = await Contenu_1.default.findByIdAndDelete(id);
        if (!contenu) {
            throw (0, http_errors_1.default)(404, 'Contenu non trouvé');
        }
        return contenu;
    }
}
class ContenuController {
}
_a = ContenuController;
ContenuController.create = async (req, res, next) => {
    try {
        const contenu = await ContenuService.create(req.body, req.file);
        res.status(201).json(contenu);
    }
    catch (err) {
        next(err);
    }
};
ContenuController.getAll = async (req, res, next) => {
    try {
        const contenus = await ContenuService.getAll();
        res.json(contenus);
    }
    catch (err) {
        next(err);
    }
};
ContenuController.getById = async (req, res, next) => {
    try {
        const contenu = await ContenuService.getById(req.params.id);
        res.json(contenu);
    }
    catch (err) {
        next(err);
    }
};
ContenuController.update = async (req, res, next) => {
    try {
        const contenu = await ContenuService.update(req.params.id, req.body, req.file);
        res.json(contenu);
    }
    catch (err) {
        next(err);
    }
};
ContenuController.delete = async (req, res, next) => {
    try {
        const contenu = await ContenuService.delete(req.params.id);
        res.json({ message: 'Contenu supprimé' });
    }
    catch (err) {
        next(err);
    }
};
exports.default = ContenuController;
//# sourceMappingURL=ContenuController.js.map