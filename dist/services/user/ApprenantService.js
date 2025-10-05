"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApprenantProgress = exports.enrollApprenant = exports.getApprenantCertificates = exports.getApprenantProgress = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = __importDefault(require("../../models/user/User"));
const InscriptionService = __importStar(require("../../services/learning/InscriptionService"));
const ProgressionService = __importStar(require("../../services/learning/ProgressionService"));
// Get apprenant's progress
const getApprenantProgress = async (apprenantId) => {
    const apprenant = await User_1.default.findById(apprenantId).populate('progres');
    if (!apprenant) {
        throw (0, http_errors_1.default)(404, 'Apprenant non trouvé');
    }
    return apprenant.progres || [];
};
exports.getApprenantProgress = getApprenantProgress;
// Get apprenant's certificates
const getApprenantCertificates = async (apprenantId) => {
    const apprenant = await User_1.default.findById(apprenantId).populate('certificats');
    if (!apprenant) {
        throw (0, http_errors_1.default)(404, 'Apprenant non trouvé');
    }
    return apprenant.certificats || [];
};
exports.getApprenantCertificates = getApprenantCertificates;
// Enroll apprenant in a course
const enrollApprenant = async (apprenantId, coursId) => {
    return await InscriptionService.enroll(apprenantId, coursId);
};
exports.enrollApprenant = enrollApprenant;
// Update apprenant's progress
const updateApprenantProgress = async (apprenantId, coursId, pourcentage) => {
    return await ProgressionService.update(apprenantId, coursId, pourcentage);
};
exports.updateApprenantProgress = updateApprenantProgress;
//# sourceMappingURL=ApprenantService.js.map