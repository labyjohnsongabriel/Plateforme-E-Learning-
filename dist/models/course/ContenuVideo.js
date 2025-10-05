"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/learning/Video.ts
const mongoose_1 = require("mongoose");
const Contenu_1 = __importDefault(require("./Contenu"));
// Schéma pour le discriminateur Vidéo
const contenuVideoSchema = new mongoose_1.Schema({
    urlVideo: { type: String, required: true },
    duree: { type: Number, required: false },
});
// Discriminateur pour Vidéo
exports.default = Contenu_1.default.discriminator('Video', contenuVideoSchema);
//# sourceMappingURL=ContenuVideo.js.map