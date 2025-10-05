"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma pour Cours
const coursSchema = new mongoose_1.Schema({
    titre: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    duree: { type: Number, required: true },
    domaineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Domaine',
        required: true,
    },
    niveau: {
        type: String,
        enum: ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
        required: true,
    },
    createur: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contenus: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Contenu', default: [] }],
    quizzes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', default: [] }],
    datePublication: { type: Date },
    estPublie: { type: Boolean, default: false },
    statutApprobation: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
        required: true,
    },
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
    this.datePublication = new Date();
    await this.save();
    const Notification = (0, mongoose_1.model)('Notification');
    await Notification.create({
        message: `Le cours "${this.titre}" est maintenant publié !`,
        type: 'RAPPEL_COURS',
        destinataires: [],
    });
    return this;
};
// Méthode pour calculer la complétion moyenne
coursSchema.methods.calculerCompletionMoyenne = async function () {
    const Progression = (0, mongoose_1.model)('Progression');
    const progressions = await Progression.aggregate([
        { $match: { cours: this._id } },
        { $group: { _id: null, moyenne: { $avg: '$pourcentage' } } },
    ]);
    return progressions.length > 0 ? progressions[0].moyenne : 0;
};
// Modèle Cours
const Cours = (0, mongoose_1.model)('Cours', coursSchema);
exports.default = Cours;
//# sourceMappingURL=Cours.js.map