"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const domaineSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        enum: ["Informatique", "Communication", "Multimedia"],
        unique: true, // Ensure domain names are unique
    },
    description: { type: String },
    cours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cours" }],
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
        throw new Error(`Erreur lors de l'ajout du cours: ${err.message}`);
    }
};
// Méthode pour obtenir des statistiques par domaine
domaineSchema.methods.getStatistiques = async function () {
    try {
        const Cours = mongoose.model("Cours");
        const cours = await Cours.find({ domaineId: this._id }); // Changed from `domaine` to `domaineId`
        const totalDuree = cours.reduce((sum, c) => sum + (c.duree || 0), 0); // Use reduce for safer summation
        return {
            nombreCours: cours.length,
            dureeTotale: totalDuree,
        };
    }
    catch (err) {
        throw new Error(`Erreur lors du calcul des statistiques: ${err.message}`);
    }
};
// Add index for faster queries
domaineSchema.index({ nom: 1 });
module.exports = mongoose.model("Domaine", domaineSchema);
//# sourceMappingURL=Domaine.js.map