"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User_1 = __importDefault(require("./User"));
// Schéma pour le discriminateur Apprenant
const apprenantSchema = new mongoose_1.Schema({
    progres: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Progression' }],
    certificats: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Certificat' }],
});
// Discriminateur pour Apprenant
exports.default = User_1.default.discriminator('apprenant', apprenantSchema);
//# sourceMappingURL=Apprenant.js.map