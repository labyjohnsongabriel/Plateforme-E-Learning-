const Contenu = require("./Contenu");

const contenuDocumentSchema = new mongoose.Schema({
  urlDocument: { type: String, required: true },
  type: { type: String, enum: ["pdf", "doc", "other"] },
});

module.exports = Contenu.discriminator("document", contenuDocumentSchema);
