// models/course/Domaine.js
const mongoose = require("mongoose");

const domaineSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    enum: ["Informatique", "Communication", "Multimedia"],
  },
  description: { type: String },
  cours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cours" }],
});

// Méthode pour ajouter un cours (ajouterCours)
domaineSchema.methods.ajouterCours = async function (coursId) {
  if (!this.cours.includes(coursId)) {
    this.cours.push(coursId);
    await this.save();
  }
  return this;
};

// Innovation: Méthode pour obtenir des statistiques par domaine
domaineSchema.methods.getStatistiques = async function () {
  const Cours = mongoose.model("Cours");
  const cours = await Cours.find({ domaine: this._id });
  let totalDuree = 0;
  cours.forEach(c => totalDuree += c.duree);
  return { nombreCours: cours.length, dureeTotale: totalDuree };
};

module.exports = mongoose.model("Domaine", domaineSchema);