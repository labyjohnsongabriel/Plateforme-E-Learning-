"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDomaine = exports.createDomaine = exports.submitQuiz = exports.updateQuiz = exports.createQuiz = exports.updateContenu = exports.createContenu = exports.update = exports.create = void 0;
const express_validator_1 = require("express-validator");
const NiveauFormation_1 = require("../models/enums/NiveauFormation");
/**
 * @desc Validation for creating a course
 */
exports.create = [
    (0, express_validator_1.body)('titre').trim().notEmpty().withMessage('Le titre est requis'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('La description est requise'),
    (0, express_validator_1.body)('domaine').isMongoId().withMessage('Domaine ID invalide'),
    (0, express_validator_1.body)('niveau').isIn(Object.values(NiveauFormation_1.NiveauFormation)).withMessage('Niveau de formation invalide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for updating a course
 */
exports.update = [
    (0, express_validator_1.body)('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
    (0, express_validator_1.body)('description').optional().trim().notEmpty().withMessage('La description ne peut pas être vide'),
    (0, express_validator_1.body)('domaine').optional().isMongoId().withMessage('Domaine ID invalide'),
    (0, express_validator_1.body)('niveau').optional().isIn(Object.values(NiveauFormation_1.NiveauFormation)).withMessage('Niveau de formation invalide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for creating course content
 */
exports.createContenu = [
    (0, express_validator_1.body)('titre').trim().notEmpty().withMessage('Le titre est requis'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('cours').isMongoId().withMessage('Cours ID invalide'),
    (0, express_validator_1.body)('type').isIn(['video', 'document']).withMessage('Type de contenu invalide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for updating course content
 */
exports.updateContenu = [
    (0, express_validator_1.body)('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('type').optional().isIn(['video', 'document']).withMessage('Type de contenu invalide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for creating a quiz
 */
exports.createQuiz = [
    (0, express_validator_1.body)('cours').isMongoId().withMessage('Cours ID invalide'),
    (0, express_validator_1.body)('titre').trim().notEmpty().withMessage('Le titre est requis'),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }).withMessage('Au moins une question est requise'),
    (0, express_validator_1.body)('questions.*.texte').trim().notEmpty().withMessage('Le texte de la question est requis'),
    (0, express_validator_1.body)('questions.*.options').isArray({ min: 2 }).withMessage('Chaque question doit avoir au moins deux options'),
    (0, express_validator_1.body)('questions.*.correctAnswer').trim().notEmpty().withMessage('La réponse correcte est requise'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for updating a quiz
 */
exports.updateQuiz = [
    (0, express_validator_1.body)('titre').optional().trim().notEmpty().withMessage('Le titre ne peut pas être vide'),
    (0, express_validator_1.body)('questions').optional().isArray({ min: 1 }).withMessage('Au moins une question est requise'),
    (0, express_validator_1.body)('questions.*.texte').optional().trim().notEmpty().withMessage('Le texte de la question ne peut pas être vide'),
    (0, express_validator_1.body)('questions.*.options').optional().isArray({ min: 2 }).withMessage('Chaque question doit avoir au moins deux options'),
    (0, express_validator_1.body)('questions.*.correctAnswer').optional().trim().notEmpty().withMessage('La réponse correcte est requise'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for submitting a quiz
 */
exports.submitQuiz = [
    (0, express_validator_1.body)('reponses').isArray({ min: 1 }).withMessage('Au moins une réponse est requise'),
    (0, express_validator_1.body)('reponses.*').trim().notEmpty().withMessage('Chaque réponse doit être non vide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for creating a domain
 */
exports.createDomaine = [
    (0, express_validator_1.body)('nom').trim().notEmpty().withMessage('Le nom du domaine est requis'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation for updating a domain
 */
exports.updateDomaine = [
    (0, express_validator_1.body)('nom').optional().trim().notEmpty().withMessage('Le nom du domaine ne peut pas être vide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
//# sourceMappingURL=courseValidator.js.map