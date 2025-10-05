"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.updateProgress = exports.enroll = void 0;
const joi_1 = __importDefault(require("joi"));
const StatutInscription_1 = require("../models/enums/StatutInscription");
// Validation schema for enrolling in a course
exports.enroll = [
    joi_1.default.object({
        coursId: joi_1.default.string().required().messages({
            'string.base': 'L\'ID du cours doit être une chaîne',
            'any.required': 'L\'ID du cours est requis',
        }),
    }).validateAsync.bind(joi_1.default.object({
        coursId: joi_1.default.string().required(),
    })),
    async (req, res, next) => {
        try {
            await exports.enroll[0](req.body);
            next();
        }
        catch (err) {
            return res.status(400).json({ errors: [{ msg: err.message }] });
        }
    },
];
// Validation schema for updating progress
exports.updateProgress = [
    joi_1.default.object({
        pourcentage: joi_1.default.number().min(0).max(100).required().messages({
            'number.base': 'Le pourcentage doit être un nombre',
            'number.min': 'Le pourcentage doit être au moins 0',
            'number.max': 'Le pourcentage ne peut pas dépasser 100',
            'any.required': 'Le pourcentage est requis',
        }),
    }).validateAsync.bind(joi_1.default.object({
        pourcentage: joi_1.default.number().min(0).max(100).required(),
    })),
    async (req, res, next) => {
        try {
            await exports.updateProgress[0](req.body);
            next();
        }
        catch (err) {
            return res.status(400).json({ errors: [{ msg: err.message }] });
        }
    },
];
// Validation schema for updating inscription status
exports.updateStatus = [
    joi_1.default.object({
        statut: joi_1.default.string()
            .valid(...Object.values(StatutInscription_1.StatutInscription))
            .required()
            .messages({
            'string.base': 'Le statut doit être une chaîne',
            'any.only': 'Statut d\'inscription invalide',
            'any.required': 'Le statut est requis',
        }),
    }).validateAsync.bind(joi_1.default.object({
        statut: joi_1.default.string().valid(...Object.values(StatutInscription_1.StatutInscription)).required(),
    })),
    async (req, res, next) => {
        try {
            await exports.updateStatus[0](req.body);
            next();
        }
        catch (err) {
            return res.status(400).json({ errors: [{ msg: err.message }] });
        }
    },
];
//# sourceMappingURL=learningValidator.js.map