"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma pour Question
const questionSchema = new mongoose_1.Schema({
    enonce: { type: String, required: true },
    reponses: [{ type: String, required: true }], // Liste des options
    reponseCorrecte: { type: Number, required: true }, // Index de la réponse correcte
    quiz: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true },
});
// Méthode statique pour générer une question aléatoire
questionSchema.statics.genererAleatoire = async function (quizId) {
    const count = await this.countDocuments({ quiz: quizId });
    const random = Math.floor(Math.random() * count);
    return this.findOne({ quiz: quizId }).skip(random);
};
// Modèle Question
const Question = (0, mongoose_1.model)('Question', questionSchema);
exports.default = Question;
//# sourceMappingURL=Question.js.map