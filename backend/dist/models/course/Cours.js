"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const coursSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String, required: true },
    duree: { type: Number, required: true }, // In hours
    domaineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domaine",
        required: true,
    }, // Changed from `domaine` to `domaineId`
    niveau: {
        type: String,
        enum: ["ALFA", "BETA", "GAMMA", "DELTA"],
        required: true,
    },
    createur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    contenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contenu" }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    datePublication: { type: Date, default: Date.now },
    estPublie: { type: Boolean, default: false },
}, { timestamps: true });
// Méthode pour ajouter du contenu
coursSchema.methods.ajouterContenu = async function (contenuId) {
    if (!this.contenus.includes(contenuId)) {
        this.contenus.push(contenuId);
        await this.save();
    }
    return this;
};
// Méthode pour publier le cours
coursSchema.methods.publier = async function () {
    this.estPublie = true;
    await this.save();
    const Notification = mongoose.model("Notification");
    await Notification.create({
        message: `Le cours "${this.titre}" est maintenant publié !`,
        type: "RAPPEL_COURS",
        destinataires: [],
    });
    return this;
};
// Méthode pour calculer la complétion moyenne
coursSchema.methods.calculerCompletionMoyenne = async function () {
    const Progression = mongoose.model("Progression");
    const progressions = await Progression.aggregate([
        { $match: { cours: this._id } },
        { $group: { _id: null, moyenne: { $avg: "$avancement" } } },
    ]);
    return progressions.length > 0 ? progressions[0].moyenne : 0;
};
module.exports = mongoose.model("Cours", coursSchema);
//# sourceMappingURL=Cours.js.map