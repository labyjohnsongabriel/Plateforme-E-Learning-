"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEnrollment = exports.updateStatus = exports.getUserEnrollments = exports.enroll = exports.StatutInscription = void 0;
const Inscription_1 = __importDefault(require("../../models/learning/Inscription"));
const Cours_1 = __importDefault(require("../../models/course/Cours"));
const Progression_1 = __importDefault(require("../../models/learning/Progression"));
// Placeholder enum for StatutInscription (based on usage)
var StatutInscription;
(function (StatutInscription) {
    StatutInscription["EN_COURS"] = "EN_COURS";
    StatutInscription["COMPLETE"] = "COMPLETE";
    // Add other statuses as needed
})(StatutInscription || (exports.StatutInscription = StatutInscription = {}));
// Enroll a user in a course
const enroll = async (apprenantId, coursId) => {
    try {
        const cours = await Cours_1.default.findById(coursId);
        if (!cours) {
            throw new Error('Cours non trouvé');
        }
        const existing = await Inscription_1.default.findOne({ apprenant: apprenantId, cours: coursId });
        if (existing) {
            throw new Error('Déjà inscrit à ce cours');
        }
        const inscription = new Inscription_1.default({
            apprenant: apprenantId,
            cours: coursId,
        });
        await inscription.save();
        const progression = new Progression_1.default({
            apprenant: apprenantId,
            cours: coursId,
            pourcentage: 0,
            statut: StatutInscription.EN_COURS,
        });
        await progression.save();
        return inscription;
    }
    catch (err) {
        console.error('Erreur lors de l\'inscription:', err);
        throw err;
    }
};
exports.enroll = enroll;
// Get all enrollments for a user
const getUserEnrollments = async (apprenantId) => {
    try {
        const enrollments = await Inscription_1.default.find({ apprenant: apprenantId }).populate('cours', 'titre niveau domaine');
        return enrollments;
    }
    catch (err) {
        throw err;
    }
};
exports.getUserEnrollments = getUserEnrollments;
// Update enrollment status
const updateStatus = async (inscriptionId, newStatus, apprenantId) => {
    try {
        const inscription = await Inscription_1.default.findOne({ _id: inscriptionId, apprenant: apprenantId });
        if (!inscription) {
            throw new Error('Inscription non trouvée ou non autorisée');
        }
        if (!Object.values(StatutInscription).includes(newStatus)) {
            throw new Error('Statut invalide');
        }
        inscription.statut = newStatus;
        await inscription.save();
        if (newStatus === StatutInscription.COMPLETE) {
            const progression = await Progression_1.default.findOne({ apprenant: apprenantId, cours: inscription.cours });
            if (progression) {
                progression.pourcentage = 100;
                await progression.save();
                // TODO: Uncomment and implement certificate generation if needed
                // import * as CertificatController from '../controllers/learning/CertificatController';
                // await CertificatController.generateCertificate(apprenantId, inscription.cours);
            }
        }
        return inscription;
    }
    catch (err) {
        throw err;
    }
};
exports.updateStatus = updateStatus;
// Delete an enrollment
const deleteEnrollment = async (inscriptionId, apprenantId) => {
    try {
        const inscription = await Inscription_1.default.findOne({ _id: inscriptionId, apprenant: apprenantId });
        if (!inscription) {
            throw new Error('Inscription non trouvée ou non autorisée');
        }
        await Progression_1.default.deleteOne({ apprenant: apprenantId, cours: inscription.cours });
        await inscription.deleteOne();
        return { message: 'Inscription supprimée avec succès' };
    }
    catch (err) {
        throw err;
    }
};
exports.deleteEnrollment = deleteEnrollment;
//# sourceMappingURL=InscriptionService.js.map