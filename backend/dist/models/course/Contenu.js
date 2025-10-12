"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma de base pour Contenu
const contenuSchema = new mongoose_1.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true }, // URL générale pour tout type de contenu
    duree: { type: Number }, // En minutes, optionnel pour certains types
    cours: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Cours', required: true },
    type: {
        type: String,
        enum: ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE'],
        required: true,
    },
}, { discriminatorKey: 'type', timestamps: true });
// Méthode pour visualiser le contenu
contenuSchema.methods.visualiser = async function (utilisateurId) {
    const Progression = (0, mongoose_1.model)('Progression');
    await Progression.updateOne({ utilisateur: utilisateurId, cours: this.cours }, { $set: { dateDerniereActivite: new Date() }, $inc: { avancement: 5 } }, { upsert: true });
    return { message: `Contenu "${this.titre}" visualisé.` };
};
// Modèle de base Contenu
const Contenu = (0, mongoose_1.model)('Contenu', contenuSchema);
// Schéma pour Vidéo
const videoSchema = new mongoose_1.Schema({});
// Schéma pour Document
const documentSchema = new mongoose_1.Schema({
    format: { type: String, enum: ['pdf', 'doc', 'other'] },
});
// Schéma pour Exercice
const exerciceSchema = new mongoose_1.Schema({
    instructions: { type: String },
});
// Discriminateurs
Contenu.discriminator('VIDEO', videoSchema);
Contenu.discriminator('DOCUMENT', documentSchema);
Contenu.discriminator('EXERCICE', exerciceSchema);
exports.default = Contenu;
//# sourceMappingURL=Contenu.js.map