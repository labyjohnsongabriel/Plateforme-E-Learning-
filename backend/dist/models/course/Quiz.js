"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/course/Quiz.js
const mongoose = require("mongoose");
const quizSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    cours: { type: mongoose.Schema.Types.ObjectId, ref: "Cours", required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    scoreMinValide: { type: Number, default: 70 }, // Pourcentage minimal pour validation
}, { timestamps: true });
// Méthode pour corriger un quiz (corriger)
quizSchema.methods.corriger = async function (reponsesUtilisateur) {
    const questions = await mongoose.model("Question").find({ _id: { $in: this.questions } });
    let score = 0;
    questions.forEach((q, index) => {
        if (q.reponseCorrecte === reponsesUtilisateur[index]) {
            score += 1;
        }
    });
    const pourcentage = (score / questions.length) * 100;
    // Innovation: Si validé, déclencher un certificat si niveau approprié
    if (pourcentage >= this.scoreMinValide) {
        // Logique pour vérifier niveau et générer certificat (à connecter avec Certificat model)
    }
    return { score: pourcentage, valide: pourcentage >= this.scoreMinValide };
};
module.exports = mongoose.model("Quiz", quizSchema);
//# sourceMappingURL=Quiz.js.map