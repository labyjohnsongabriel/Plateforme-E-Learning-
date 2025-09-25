const mongoose = require("mongoose");
const StatutProgression = require("../enums/StatutProgression"); // Enum optionnel pour statut (voir ci-dessous)

const progressionSchema = new mongoose.Schema({
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
  pourcentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  dateDebut: {
    type: Date,
    default: Date.now,
  },
  dateFin: {
    type: Date,
  },
  statut: {
    type: String,
    enum: Object.values(StatutProgression),
    default: StatutProgression.EN_COURS,
  },
});

// Index unique pour éviter doublons et optimiser queries
progressionSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

module.exports = mongoose.model("Progression", progressionSchema);
