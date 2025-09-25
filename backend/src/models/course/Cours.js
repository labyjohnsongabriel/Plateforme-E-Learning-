    // models/course/Cours.js
const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  duree: { type: Number, required: true }, // In hours
  domaine: { type: mongoose.Schema.Types.ObjectId, ref: "Domaine", required: true },
  niveau: {
    type: String,
    enum: ["ALFA", "BETA", "GAMMA", "DELTA"],
    required: true,
  },
  createur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to instructor/admin
  contenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contenu" }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  datePublication: { type: Date, default: Date.now },
  estPublie: { type: Boolean, default: false },
}, { timestamps: true });

// Méthode pour ajouter du contenu (ajouterContenu)
coursSchema.methods.ajouterContenu = async function (contenuId) {
  if (!this.contenus.includes(contenuId)) {
    this.contenus.push(contenuId);
    await this.save();
  }
  return this;
};

// Méthode pour publier le cours (publier)
coursSchema.methods.publier = async function () {
  this.estPublie = true;
  await this.save();
  // Innovation: Envoyer une notification aux apprenants inscrits (implémentation fictive, à connecter avec Notification model)
  const Notification = mongoose.model("Notification");
  await Notification.create({
    message: `Le cours "${this.titre}" est maintenant publié !`,
    type: "RAPPEL_COURS",
    destinataires: [] // Remplir avec IDs d'utilisateurs inscrits
  });
  return this;
};

// Innovation: Méthode pour calculer la complétion moyenne des apprenants
coursSchema.methods.calculerCompletionMoyenne = async function () {
  const Progression = mongoose.model("Progression");
  const progressions = await Progression.aggregate([
    { $match: { cours: this._id } },
    { $group: { _id: null, moyenne: { $avg: "$avancement" } } }
  ]);
  return progressions.length > 0 ? progressions[0].moyenne : 0;
};

module.exports = mongoose.model("Cours", coursSchema);