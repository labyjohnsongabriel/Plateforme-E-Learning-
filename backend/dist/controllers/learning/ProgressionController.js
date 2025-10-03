"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProgressionService = require("../../services/learning/ProgressionService");
const CertificatService = require("../../services/learning/CertificationService"); // Renommé pour cohérence
const io = require("../../../app");
exports.getByUserAndCourse = async (req, res, next) => {
    try {
        const progression = await ProgressionService.getByUserAndCourse(req.user.id, req.params.coursId);
        res.json(progression);
    }
    catch (err) {
        next(err);
    }
};
exports.update = async (req, res, next) => {
    try {
        const { pourcentage } = req.body;
        const progression = await ProgressionService.update(req.user.id, req.params.coursId, pourcentage); // Note: Utilisez req.params.coursId si route est /progress/:coursId
        if (progression.pourcentage === 100) {
            const cert = await CertificatService.generateIfEligible(progression);
            if (cert) {
                // Notification real-time à l'utilisateur
                io.to(progression.apprenant.toString()).emit("new_certificate", cert);
                // Optionnel : Emit à admin pour tableau de bord
                io.emit("progress_update", { userId: progression.apprenant, coursId: progression.cours });
            }
        }
        res.json(progression);
    }
    catch (err) {
        console.error("Erreur controller update progression:", err);
        next(err);
    }
};
//# sourceMappingURL=ProgressionController.js.map