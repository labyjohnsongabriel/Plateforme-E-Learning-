// models/course/Question.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  enonce: { type: String, required: true },
  reponses: [{ type: String, required: true }], // Liste des options
  reponseCorrecte: { type: Number, required: true }, // Index de la réponse correcte
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
});

// Méthode pour générer une question aléatoire (genererAleatoire)
questionSchema.statics.genererAleatoire = async function (quizId) {
  // Innovation: Générer une question aléatoire pour un quiz donné
  const count = await this.countDocuments({ quiz: quizId });
  const random = Math.floor(Math.random() * count);
  return this.findOne({ quiz: quizId }).skip(random);
};

module.exports = mongoose.model("Question", questionSchema);