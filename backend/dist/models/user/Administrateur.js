"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("./User");
const administrateurSchema = new mongoose.Schema({
// No specific fields, but can add admin-specific like logs
});
module.exports = User.discriminator("administrateur", administrateurSchema);
//# sourceMappingURL=Administrateur.js.map