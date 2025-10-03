"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Domaine_1 = require("../../models/course/Domaine");
const Cours_1 = require("../../models/course/Cours");
const logger_1 = __importDefault(require("../../utils/logger"));
const types_1 = require("../../types");
class DomaineService {
    static async create(data) {
        try {
            const domaine = new Domaine_1.Domaine(data);
            await domaine.save();
            return domaine;
        }
        catch (err) {
            logger_1.default.error(`Error creating domaine: ${err.message}`);
            throw err;
        }
    }
    static async getAll() {
        try {
            const domaines = await Domaine_1.Domaine.find().lean();
            return domaines;
        }
        catch (err) {
            logger_1.default.error(`Error fetching domaines: ${err.message}`);
            throw err;
        }
    }
    static async getById(id) {
        try {
            const domaine = await Domaine_1.Domaine.findById(id).lean();
            if (!domaine) {
                throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
            }
            return domaine;
        }
        catch (err) {
            logger_1.default.error(`Error fetching domaine by ID: ${err.message}`);
            throw err;
        }
    }
    static async update(id, data) {
        try {
            const domaine = await Domaine_1.Domaine.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });
            if (!domaine) {
                throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
            }
            return domaine;
        }
        catch (err) {
            logger_1.default.error(`Error updating domaine: ${err.message}`);
            throw err;
        }
    }
    static async delete(id) {
        try {
            const domaine = await Domaine_1.Domaine.findByIdAndDelete(id);
            if (!domaine) {
                throw (0, http_errors_1.default)(404, 'Domaine non trouvé');
            }
            // Delete associated courses
            await Cours_1.Cours.deleteMany({ domaineId: id });
            return domaine;
        }
        catch (err) {
            logger_1.default.error(`Error deleting domaine: ${err.message}`);
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
        res.json({ message: 'Domaine supprimé', domaine });
    }
    catch (err) {
        next(err);
    }
};
exports.default = DomaineController;
//# sourceMappingURL=DomaineController.js.map