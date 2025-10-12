"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/learning/Progression.ts
const mongoose_1 = require("mongoose");
const ProgressionService_1 = require("../../services/learning/ProgressionService");
const progressionSchema = new mongoose_1.Schema({
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
    pourcentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    dateDebut: {
        type: Date,
        required: true,
        default: Date.now,
    },
    dateFin: {
        type: Date,
        required: false,
    },
    statut: {
        type: String,
        enum: Object.values(ProgressionService_1.StatutProgression),
        default: ProgressionService_1.StatutProgression.EN_COURS,
    },
});
progressionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });
const Progression = (0, mongoose_1.model)('Progression', progressionSchema);
exports.default = Progression;
//# sourceMappingURL=Progression.js.map