"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("./User");
const apprenantSchema = new mongoose.Schema({
    progres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Progression" }],
    certificats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Certificat" }],
});
module.exports = User.discriminator("apprenant", apprenantSchema);
//# sourceMappingURL=Apprenant.js.map