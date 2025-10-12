"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/userValidator.ts
const Joi = require('joi');
exports.update = Joi.object({
    nom: Joi.string().optional(),
    prenom: Joi.string().optional(),
});
exports.changePassword = Joi.object({
    ancienMotDePasse: Joi.string().required(),
    nouveauMotDePasse: Joi.string().min(6).required(),
});
exports.resetPassword = Joi.object({
    email: Joi.string().email().required(),
});
exports.setNewPassword = Joi.object({
    token: Joi.string().required(),
    nouveauMotDePasse: Joi.string().min(6).required(),
});
exports.deleteUser = Joi.object({
    motDePasse: Joi.string().required(),
});
// ... other schemas as in the ESM version ...
exports.getNewUsers = Joi.object({
    days: Joi.number().min(1).required(),
});
//# sourceMappingURL=userValidator.js.map