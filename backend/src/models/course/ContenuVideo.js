const Contenu = require("./Contenu");

const contenuVideoSchema = new mongoose.Schema({
  urlVideo: { type: String, required: true },
  duree: Number,
});

module.exports = Contenu.discriminator("video", contenuVideoSchema);
