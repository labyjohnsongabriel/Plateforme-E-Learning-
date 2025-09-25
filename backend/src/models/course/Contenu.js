// models/course/Contenu.js
const mongoose = require("mongoose");

const contenuSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true }, // URL générale pour tout type de contenu
  duree: { type: Number }, // En minutes, optionnel pour certains types
  cours: { type: mongoose.Schema.Types.ObjectId, ref: "Cours", required: true },
  type: {
    type: String,
    enum: ["VIDEO", "DOCUMENT", "QUIZ", "EXERCICE"],
    required: true,
  },
}, { discriminatorKey: "type", timestamps: true });

// Méthode pour visualiser le contenu (visualiser)
contenuSchema.methods.visualiser = async function (utilisateurId) {
  // Innovation: Enregistrer l'activité dans Progression
  const Progression = mongoose.model("Progression");
  await Progression.updateOne(
    { utilisateur: utilisateurId, cours: this.cours },
    { $set: { dateDerniereActivite: new Date() }, $inc: { avancement: 5 } }, // Incrémente de 5% par visualisation
    { upsert: true }
  );
  return { message: `Contenu "${this.titre}" visualisé.` };
};

const Contenu = mongoose.model("Contenu", contenuSchema);

// Discriminateur pour Vidéo
const videoSchema = new mongoose.Schema({
  // Champs spécifiques si nécessaires, mais url et duree sont déjà dans base
});
Contenu.discriminator("VIDEO", videoSchema);

// Discriminateur pour Document
const documentSchema = new mongoose.Schema({
  format: { type: String, enum: ["pdf", "doc", "other"] },
});
Contenu.discriminator("DOCUMENT", documentSchema);

// Discriminateur pour Exercice (innovation: ajout pour complétude)
const exerciceSchema = new mongoose.Schema({
  instructions: { type: String },
});
Contenu.discriminator("EXERCICE", exerciceSchema);

module.exports = Contenu;