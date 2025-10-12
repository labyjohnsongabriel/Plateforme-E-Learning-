"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewUsers = exports.getInactiveUsers = exports.getActiveUsers = exports.getUserStatistics = exports.deleteProfile = exports.changeProfilePicture = exports.updateProfile = exports.getProfile = exports.sort = exports.filter = exports.search = exports.getAll = exports.getById = exports.deleteSchema = exports.setNewPassword = exports.resetPassword = exports.changePassword = exports.update = exports.login = exports.register = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
// Middleware pour formater les erreurs Joi
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((err) => ({
                type: 'field',
                msg: err.message,
                path: err.path[0],
                location: 'body',
            }));
            return res.status(400).json({ errors });
        }
        next();
    };
};
exports.validate = validate;
exports.register = joi_1.default.object({
    nom: joi_1.default.string().required().messages({
        'string.empty': 'Le nom est requis',
        'any.required': 'Le nom est requis',
    }),
    prenom: joi_1.default.string().required().messages({
        'string.empty': 'Le prénom est requis',
        'any.required': 'Le prénom est requis',
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': "Format d'email invalide",
        'string.empty': "L'email est requis",
        'any.required': "L'email est requis",
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
    }),
    role: joi_1.default.string().optional(),
});
exports.login = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': "Format d'email invalide",
        'string.empty': "L'email est requis",
        'any.required': "L'email est requis",
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
    }),
});
exports.update = joi_1.default.object({
    nom: joi_1.default.string().optional().messages({
        'string.empty': 'Le nom ne peut pas être vide',
    }),
    prenom: joi_1.default.string().optional().messages({
        'string.empty': 'Le prénom ne peut pas être vide',
    }),
});
exports.changePassword = joi_1.default.object({
    ancienMotDePasse: joi_1.default.string().required().messages({
        'string.empty': "L'ancien mot de passe est requis",
        'any.required': "L'ancien mot de passe est requis",
    }),
    nouveauMotDePasse: joi_1.default.string().min(6).required().messages({
        'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        'string.empty': 'Le nouveau mot de passe est requis',
        'any.required': 'Le nouveau mot de passe est requis',
    }),
});
exports.resetPassword = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': "Format d'email invalide",
        'string.empty': "L'email est requis",
        'any.required': "L'email est requis",
    }),
});
exports.setNewPassword = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'string.empty': 'Le token est requis',
        'any.required': 'Le token est requis',
    }),
    nouveauMotDePasse: joi_1.default.string().min(6).required().messages({
        'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        'string.empty': 'Le nouveau mot de passe est requis',
        'any.required': 'Le nouveau mot de passe est requis',
    }),
});
exports.deleteSchema = joi_1.default.object({
    motDePasse: joi_1.default.string().required().messages({
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
    }),
});
exports.getById = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required().messages({
        'string.hex': "L'ID doit être un identifiant hexadécimal valide",
        'string.length': "L'ID doit avoir 24 caractères",
        'any.required': "L'ID est requis",
    }),
});
exports.getAll = joi_1.default.object({
    page: joi_1.default.number().min(1).optional().messages({
        'number.min': 'La page doit être au moins 1',
    }),
    limit: joi_1.default.number().min(1).max(100).optional().messages({
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100',
    }),
});
exports.search = joi_1.default.object({
    query: joi_1.default.string().required().messages({
        'string.empty': 'La requête de recherche est requise',
        'any.required': 'La requête de recherche est requise',
    }),
    page: joi_1.default.number().min(1).optional().messages({
        'number.min': 'La page doit être au moins 1',
    }),
    limit: joi_1.default.number().min(1).max(100).optional().messages({
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100',
    }),
});
exports.filter = joi_1.default.object({
    role: joi_1.default.string().optional(),
    dateInscription: joi_1.default.date().optional(),
    dernierConnexion: joi_1.default.date().optional(),
    page: joi_1.default.number().min(1).optional().messages({
        'number.min': 'La page doit être au moins 1',
    }),
    limit: joi_1.default.number().min(1).max(100).optional().messages({
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100',
    }),
});
exports.sort = joi_1.default.object({
    sortBy: joi_1.default.string()
        .valid('nom', 'prenom', 'email', 'dateInscription', 'dernierConnexion')
        .optional()
        .messages({
        'any.only': "Le champ de tri doit être l'un de : nom, prenom, email, dateInscription, dernierConnexion",
    }),
    order: joi_1.default.string().valid('asc', 'desc').optional().messages({
        'any.only': "L'ordre doit être 'asc' ou 'desc'",
    }),
    page: joi_1.default.number().min(1).optional().messages({
        'number.min': 'La page doit être au moins 1',
    }),
    limit: joi_1.default.number().min(1).max(100).optional().messages({
        'number.min': 'La limite doit être au moins 1',
        'number.max': 'La limite ne peut pas dépasser 100',
    }),
});
exports.getProfile = joi_1.default.object({});
exports.updateProfile = joi_1.default.object({
    nom: joi_1.default.string().optional().messages({
        'string.empty': 'Le nom ne peut pas être vide',
    }),
    prenom: joi_1.default.string().optional().messages({
        'string.empty': 'Le prénom ne peut pas être vide',
    }),
});
exports.changeProfilePicture = joi_1.default.object({});
exports.deleteProfile = joi_1.default.object({
    motDePasse: joi_1.default.string().required().messages({
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
    }),
});
exports.getUserStatistics = joi_1.default.object({
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
});
exports.getActiveUsers = joi_1.default.object({
    days: joi_1.default.number().min(1).required().messages({
        'number.min': 'Le nombre de jours doit être au moins 1',
        'any.required': 'Le nombre de jours est requis',
    }),
});
exports.getInactiveUsers = joi_1.default.object({
    days: joi_1.default.number().min(1).required().messages({
        'number.min': 'Le nombre de jours doit être au moins 1',
        'any.required': 'Le nombre de jours est requis',
    }),
});
exports.getNewUsers = joi_1.default.object({
    days: joi_1.default.number().min(1).required().messages({
        'number.min': 'Le nombre de jours doit être au moins 1',
        'any.required': 'Le nombre de jours est requis',
    }),
});
//# sourceMappingURL=authValidator.js.map