const mongoose = require("mongoose");
const User = require("./User");

const instructeurSchema = new mongoose.Schema({
  coursCrees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
      required: true,
    },
  ],
  coursEnCoursEdition: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
    },
  ],
  statutApprobation: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  biographie: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true, // Ajoute createdAt et updatedAt
});

// Index pour optimiser les recherches par cours créés
instructeurSchema.index({ "coursCrees": 1 }, { unique: false, partialFilterExpression: { "coursCrees": { $exists: true } } });

// Middleware pour population automatique (optionnel, selon usage)
instructeurSchema.pre("find", function (next) {
  this.populate("coursCrees coursEnCoursEdition");
  next();
});

module.exports = User.discriminator("Instructeur", instructeurSchema);