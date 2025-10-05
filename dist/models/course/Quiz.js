"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schéma pour Quiz
const quizSchema = new mongoose_1.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    cours: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Cours', required: true },
    questions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Question' }],
    scoreMinValide: { type: Number, default: 70 }, // Pourcentage minimal pour validation
}, { timestamps: true });
// Méthode pour corriger un quiz
quizSchema.methods.corriger = async function (reponsesUtilisateur) {
    const Question = (0, mongoose_1.model)('Question');
    const questions = await Question.find({ _id: { $in: this.questions } });
    let score = 0;
    questions.forEach((q, index) => {
        if (q.reponseCorrecte === reponsesUtilisateur[index]) {
            score += 1;
        }
    });
    const pourcentage = (questions.length > 0 ? score / questions.length : 0) * 100;
    // Innovation: Si validé, déclencher un certificat si niveau approprié
    if (pourcentage >= this.scoreMinValide) {
        // Logique pour vérifier niveau et générer certificat (à connecter avec Certificat model)
    }
    return { score: pourcentage, valide: pourcentage >= this.scoreMinValide };
};
// Modèle Quiz
const Quiz = (0, mongoose_1.model)('Quiz', quizSchema);
exports.default = Quiz;
//# sourceMappingURL=Quiz.js.map