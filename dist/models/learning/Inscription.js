"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/learning/Inscription.ts
const mongoose_1 = require("mongoose");
const StatutInscription_1 = require("../../models/enums/StatutInscription"); // Adjust path as needed
// Schéma pour Inscription
const inscriptionSchema = new mongoose_1.Schema({
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
    dateInscription: {
        type: Date,
        default: Date.now,
    },
    statut: {
        type: String,
        enum: Object.values(StatutInscription_1.StatutInscription),
        default: StatutInscription_1.StatutInscription.EN_COURS,
    },
});
// Index unique pour éviter doublons
inscriptionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });
// Modèle Inscription
const Inscription = (0, mongoose_1.model)('Inscription', inscriptionSchema);
exports.default = Inscription;
//# sourceMappingURL=Inscription.js.map