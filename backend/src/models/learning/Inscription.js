const mongoose = require("mongoose");
const StatutInscription = require("../enums/StatutInscription"); // Chemin relatif ajusté

const inscriptionSchema = new mongoose.Schema({
  apprenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cours",
    required: true,
  },
  dateInscription: {
    type: Date,
    default: Date.now,
  },
  statut: {
    type: String,
    enum: Object.values(StatutInscription),
    default: StatutInscription.EN_COURS,
  },
});

// Index unique pour éviter doublons
inscriptionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

module.exports = mongoose.model("Inscription", inscriptionSchema);