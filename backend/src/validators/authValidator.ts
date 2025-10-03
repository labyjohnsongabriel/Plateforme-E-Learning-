const { body, validationResult } = require("express-validator");
const RoleUtilisateur = require("../../src/models/enums/RoleUtilisateur");

/**
 * @desc Validation pour l'inscription
 */
exports.register = [
  body("email").isEmail().withMessage("Format d'email invalide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("nom").notEmpty().withMessage("Le nom est requis"),
  body("prenom").notEmpty().withMessage("Le prénom est requis"),
  body("role")
    .optional()
    .isIn(Object.values(RoleUtilisateur))
    .withMessage("Rôle invalide"),
  (req, res, next) => {
    const errors = validationResult(req);
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
  body("email").isEmail().withMessage("Format d'email invalide"),
  body("password").notEmpty().withMessage("Le mot de passe est requis"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = exports;
