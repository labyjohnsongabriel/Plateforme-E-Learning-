"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const progressionSchema = new mongoose_1.Schema({
    apprenant: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    cours: { type: mongoose_1.Types.ObjectId, ref: 'Cours', required: true },
    pourcentage: { type: Number, required: true, min: 0, max: 100 },
    avancement: { type: Number, required: true, default: 0 },
    dateDebut: { type: Date, required: true, default: Date.now },
    dateFin: { type: Date },
}, { timestamps: true });
const Progression = (0, mongoose_1.model)('Progression', progressionSchema);
exports.default = Progression;
//# sourceMappingURL=Progression.js.map