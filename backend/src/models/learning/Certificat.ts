const mongoose = require("mongoose");

const certificatSchema = new mongoose.Schema({
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
  dateEmission: {
    type: Date,
    default: Date.now,
  },
  urlCertificat: {
    type: String,
    required: true,
  },
});

// Index pour accélérer les recherches par apprenant et cours (évite les doublons et optimise les queries)
certificatSchema.index({ apprenant: 1, cours: 1 }, { unique: true });

module.exports = mongoose.model("Certificat", certificatSchema);