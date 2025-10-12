"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const InscriptionService_1 = __importDefault(require("../../services/learning/InscriptionService"));
class InscriptionController {
}
_a = InscriptionController;
InscriptionController.enroll = async (req, res, next) => {
    try {
        if (!req.user?.id)
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        const inscription = await InscriptionService_1.default.enroll(req.user.id, req.body.coursId);
        res.status(201).json(inscription);
    }
    catch (err) {
        next(err);
    }
};
InscriptionController.getUserEnrollments = async (req, res, next) => {
    try {
        if (!req.user?.id)
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        const enrollments = await InscriptionService_1.default.getUserEnrollments(req.user.id);
        res.json(enrollments);
    }
    catch (err) {
        next(err);
    }
};
InscriptionController.updateStatus = async (req, res, next) => {
    try {
        if (!req.user?.id)
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        const inscription = await InscriptionService_1.default.updateStatus(req.params.id, req.body.statut, req.user.id);
        res.json(inscription);
    }
    catch (err) {
        next(err);
    }
};
InscriptionController.delete = async (req, res, next) => {
    try {
        if (!req.user?.id)
            throw (0, http_errors_1.default)(401, 'Utilisateur non authentifié');
        const result = await InscriptionService_1.default.deleteEnrollment(req.params.id, req.user.id);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.default = InscriptionController;
//# sourceMappingURL=InscriptionController.js.map