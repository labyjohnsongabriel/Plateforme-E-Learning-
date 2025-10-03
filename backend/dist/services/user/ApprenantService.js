"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../models/user/User");
const InscriptionService = require("../learning/InscriptionService");
const ProgressionService = require("../learning/ProgressionService");
const CertificatService = require("../learning/CertificatService");
exports.getApprenantProgress = async (apprenantId) => {
    const apprenant = await User.findById(apprenantId).populate("progres");
    return apprenant?.progres || [];
};
exports.getApprenantCertificates = async (apprenantId) => {
    const apprenant = await User.findById(apprenantId).populate("certificats");
    return apprenant?.certificats || [];
};
exports.enrollApprenant = async (apprenantId, coursId) => {
    return await InscriptionService.enroll(apprenantId, coursId);
};
exports.updateApprenantProgress = async (apprenantId, coursId, pourcentage) => {
    return await ProgressionService.update(apprenantId, coursId, pourcentage);
};
//# sourceMappingURL=ApprenantService.js.map