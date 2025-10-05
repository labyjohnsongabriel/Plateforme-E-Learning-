"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma pour Domaine
const domaineSchema = new mongoose_1.Schema({
    nom: {
        type: String,
        required: true,
        enum: ['Informatique', 'Communication', 'Multimedia'],
        unique: true, // Ensure domain names are unique
    },
    description: { type: String },
    cours: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Cours' }],
}, { timestamps: true });
// Méthode pour ajouter un cours
domaineSchema.methods.ajouterCours = async function (coursId) {
    try {
        if (!this.cours.includes(coursId)) {
            this.cours.push(coursId);
            await this.save();
        }
        return this;
    }
    catch (err) {
        const error = err;
        throw new Error(`Erreur lors de l'ajout du cours: ${error.message}`);
    }
};
// Méthode pour obtenir des statistiques par domaine
domaineSchema.methods.getStatistiques = async function () {
    try {
        const Cours = (0, mongoose_1.model)('Cours');
        const cours = await Cours.find({ domaineId: this._id });
        const totalDuree = cours.reduce((sum, c) => sum + (c.duree || 0), 0); // Use reduce for safer summation
        return {
            nombreCours: cours.length,
            dureeTotale: totalDuree,
        };
    }
    catch (err) {
        const error = err;
        throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }
};
// Add index for faster queries
domaineSchema.index({ nom: 1 });
// Modèle Domaine
const Domaine = (0, mongoose_1.model)('Domaine', domaineSchema);
exports.default = Domaine;
//# sourceMappingURL=Domaine.js.map