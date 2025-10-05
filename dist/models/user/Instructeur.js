"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User_1 = __importDefault(require("./User"));
// Schéma pour le discriminateur Instructeur
const instructeurSchema = new mongoose_1.Schema({
    coursCrees: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Cours',
            required: true,
        },
    ],
    coursEnCoursEdition: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Cours',
        },
    ],
    statutApprobation: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    biographie: {
        type: String,
        maxlength: 500,
    },
}, { timestamps: true });
// Index pour optimiser les recherches par cours créés
instructeurSchema.index({ coursCrees: 1 }, { unique: false, partialFilterExpression: { coursCrees: { $exists: true } } });
// Middleware pour population automatique
instructeurSchema.pre('find', function (next) {
    this.populate('coursCrees coursEnCoursEdition');
    next();
});
// Discriminateur pour Instructeur
exports.default = User_1.default.discriminator('Instructeur', instructeurSchema);
//# sourceMappingURL=Instructeur.js.map