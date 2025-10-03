"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// validators/courseValidator.js
const { body } = require("express-validator");
const NiveauFormation = require("../../src/models/enums/NiveauFormation");
module.exports = {
    create: [
        body("titre").trim().notEmpty().withMessage("Le titre est requis"),
        body("description")
            .trim()
            .notEmpty()
            .withMessage("La description est requise"),
        body("domaine").isMongoId().withMessage("Domaine ID invalide"),
        body("niveau")
            .isIn(Object.values(NiveauFormation))
            .withMessage("Niveau de formation invalide"),
    ],
    update: [
        body("titre")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Le titre ne peut pas être vide"),
        body("description")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("La description ne peut pas être vide"),
        body("domaine").optional().isMongoId().withMessage("Domaine ID invalide"),
        body("niveau")
            .optional()
            .isIn(Object.values(NiveauFormation))
            .withMessage("Niveau de formation invalide"),
    ],
    createContenu: [
        body("titre").trim().notEmpty().withMessage("Le titre est requis"),
        body("description").optional().trim(),
        body("cours").isMongoId().withMessage("Cours ID invalide"),
        body("type")
            .isIn(["video", "document"])
            .withMessage("Type de contenu invalide"),
    ],
    updateContenu: [
        body("titre")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Le titre ne peut pas être vide"),
        body("description").optional().trim(),
        body("type")
            .optional()
            .isIn(["video", "document"])
            .withMessage("Type de contenu invalide"),
    ],
    createQuiz: [
        body("cours").isMongoId().withMessage("Cours ID invalide"),
        body("titre").trim().notEmpty().withMessage("Le titre est requis"),
        body("questions")
            .isArray({ min: 1 })
            .withMessage("Au moins une question est requise"),
        body("questions.*.texte")
            .trim()
            .notEmpty()
            .withMessage("Le texte de la question est requis"),
        body("questions.*.options")
            .isArray({ min: 2 })
            .withMessage("Chaque question doit avoir au moins deux options"),
        body("questions.*.correctAnswer")
            .trim()
            .notEmpty()
            .withMessage("La réponse correcte est requise"),
    ],
    updateQuiz: [
        body("titre")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Le titre ne peut pas être vide"),
        body("questions")
            .optional()
            .isArray({ min: 1 })
            .withMessage("Au moins une question est requise"),
        body("questions.*.texte")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Le texte de la question ne peut pas être vide"),
        body("questions.*.options")
            .optional()
            .isArray({ min: 2 })
            .withMessage("Chaque question doit avoir au moins deux options"),
        body("questions.*.correctAnswer")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("La réponse correcte est requise"),
    ],
    submitQuiz: [
        body("reponses")
            .isArray({ min: 1 })
            .withMessage("Au moins une réponse est requise"),
        body("reponses.*")
            .trim()
            .notEmpty()
            .withMessage("Chaque réponse doit être non vide"),
    ],
    createDomaine: [
        body("nom").trim().notEmpty().withMessage("Le nom du domaine est requis"),
    ],
    updateDomaine: [
        body("nom")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Le nom du domaine ne peut pas être vide"),
    ],
};
//# sourceMappingURL=courseValidator.js.map