"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InscriptionService = require("../../services/learning/InscriptionService");
exports.enroll = async (req, res, next) => {
    try {
        const inscription = await InscriptionService.enroll(req.user.id, req.body.coursId);
        res.status(201).json(inscription);
    }
    catch (err) {
        console.error("Erreur controller enroll:", err);
        next(err);
    }
};
exports.getUserEnrollments = async (req, res, next) => {
    try {
        const enrollments = await InscriptionService.getUserEnrollments(req.user.id);
        res.json(enrollments);
    }
    catch (err) {
        next(err);
    }
};
exports.updateStatus = async (req, res, next) => {
    try {
        const { statut } = req.body;
        const inscription = await InscriptionService.updateStatus(req.params.id, statut, req.user.id);
        res.json(inscription);
    }
    catch (err) {
        next(err);
    }
};
exports.delete = async (req, res, next) => {
    try {
        const result = await InscriptionService.deleteEnrollment(req.params.id, req.user.id);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=InscriptionController.js.map