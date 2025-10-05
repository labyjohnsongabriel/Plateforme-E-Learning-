"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/learning/Certificat.ts
const mongoose_1 = require("mongoose");
// Schéma pour Certificat
const certificatSchema = new mongoose_1.Schema({
    apprenant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cours: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Cours',
        required: true,
    },
    dateEmission: {
        type: Date,
        default: Date.now,
    },
    urlCertificat: {
        type: String,
        required: true,
    },
});
// Index pour accélérer les recherches par apprenant et cours (évite les doublons et optimise les queries)
certificatSchema.index({ apprenant: 1, cours: 1 }, { unique: true });
// Modèle Certificat
const Certificat = (0, mongoose_1.model)('Certificat', certificatSchema);
exports.default = Certificat;
//# sourceMappingURL=Certificat.js.map