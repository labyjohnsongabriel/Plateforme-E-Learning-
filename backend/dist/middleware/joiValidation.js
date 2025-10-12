"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joiValidation = void 0;
/**
 * Middleware de validation Joi pour Express
 * @param schema - Schéma Joi à valider
 * @returns Middleware Express
 */
const joiValidation = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false, // Retourne toutes les erreurs, pas seulement la première
            allowUnknown: false // Rejette les champs non définis dans le schéma
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type
            }));
            res.status(400).json({
                message: 'Données de requête invalides',
                errors: errorDetails
            });
            return;
        }
        next();
    };
};
exports.joiValidation = joiValidation;
exports.default = exports.joiValidation;
//# sourceMappingURL=joiValidation.js.map