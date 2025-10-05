"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProgressions = exports.getUserProgressions = exports.getByUserAndCourse = exports.update = exports.initialize = exports.StatutProgression = void 0;
const Progression_1 = __importDefault(require("../../models/learning/Progression"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
// Placeholder enum for StatutProgression (based on usage)
var StatutProgression;
(function (StatutProgression) {
    StatutProgression["EN_COURS"] = "EN_COURS";
    StatutProgression["COMPLETE"] = "COMPLETE";
    // Add other statuses as needed
})(StatutProgression || (exports.StatutProgression = StatutProgression = {}));
// Initialize progression for a user and course
const initialize = async (apprenantId, coursId) => {
    try {
        const existing = await Progression_1.default.findOne({ apprenant: apprenantId, cours: coursId });
        if (existing) {
            return existing;
        }
        const cours = await Cours_1.default.findById(coursId);
        if (!cours) {
            throw new Error('Cours non trouvé');
        }
        const progression = new Progression_1.default({
            apprenant: apprenantId,
            cours: coursId,
            dateDebut: new Date(),
        });
        await progression.save();
        return progression;
    }
    catch (err) {
        console.error('Erreur lors de l\'initialisation de la progression:', err);
        throw err;
    }
};
exports.initialize = initialize;
// Update progression
const update = async (apprenantId, coursId, pourcentage) => {
    try {
        if (pourcentage < 0 || pourcentage > 100) {
            throw new Error('Pourcentage invalide (doit être entre 0 et 100)');
        }
        const progression = await Progression_1.default.findOne({ apprenant: apprenantId, cours: coursId });
        if (!progression) {
            throw new Error('Progression non trouvée');
        }
        progression.pourcentage = pourcentage;
        if (pourcentage === 100) {
            progression.dateFin = new Date();
            progression.statut = StatutProgression.COMPLETE;
        }
        else if (pourcentage > 0 && progression.statut === StatutProgression.EN_COURS) {
            // Optional logic for intermediate status
        }
        await progression.save();
        return progression;
    }
    catch (err) {
        console.error('Erreur lors de la mise à jour de la progression:', err);
        throw err;
    }
};
exports.update = update;
// Get progression for a user and course
const getByUserAndCourse = async (apprenantId, coursId) => {
    try {
        const progression = await Progression_1.default.findOne({ apprenant: apprenantId, cours: coursId }).populate('cours', 'titre niveau');
        if (!progression) {
            throw new Error('Progression non trouvée');
        }
        return progression;
    }
    catch (err) {
        throw err;
    }
};
exports.getByUserAndCourse = getByUserAndCourse;
// Get all progressions for a user
const getUserProgressions = async (apprenantId) => {
    try {
        const progressions = await Progression_1.default.find({ apprenant: apprenantId }).populate('cours', 'titre niveau domaine');
        return progressions;
    }
    catch (err) {
        throw err;
    }
};
exports.getUserProgressions = getUserProgressions;
// Get all progressions (for admin)
const getAllProgressions = async () => {
    try {
        const progressions = await Progression_1.default.find()
            .populate('apprenant', 'nom prenom')
            .populate('cours', 'titre');
        return progressions;
    }
    catch (err) {
        throw err;
    }
};
exports.getAllProgressions = getAllProgressions;
//# sourceMappingURL=ProgressionService.js.map