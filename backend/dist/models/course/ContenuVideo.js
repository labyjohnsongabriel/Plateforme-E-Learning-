"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Contenu = require("./Contenu");
const contenuVideoSchema = new mongoose.Schema({
    urlVideo: { type: String, required: true },
    duree: Number,
});
module.exports = Contenu.discriminator("video", contenuVideoSchema);
//# sourceMappingURL=ContenuVideo.js.map