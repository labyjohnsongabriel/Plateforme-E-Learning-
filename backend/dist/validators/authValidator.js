"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const RoleUtilisateur_1 = require("../../src/models/enums/RoleUtilisateur"); // Adjust path if needed
/**
 * @desc Validation pour l'inscription
 */
exports.register = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Format d\'email invalide'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    (0, express_validator_1.body)('nom').notEmpty().withMessage('Le nom est requis'),
    (0, express_validator_1.body)('prenom').notEmpty().withMessage('Le prénom est requis'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(Object.values(RoleUtilisateur_1.RoleUtilisateur))
        .withMessage('Rôle invalide'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
/**
 * @desc Validation pour la connexion
 */
exports.login = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Format d\'email invalide'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Le mot de passe est requis'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
//# sourceMappingURL=authValidator.js.map