"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/learning/Document.ts (supposé)
const mongoose_1 = require("mongoose");
const Contenu_1 = __importDefault(require("./Contenu"));
// Schéma pour le discriminateur Document
const contenuDocumentSchema = new mongoose_1.Schema({
    urlDocument: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'doc', 'other'] },
});
// Discriminateur pour Document
exports.default = Contenu_1.default.discriminator('document', contenuDocumentSchema);
//# sourceMappingURL=ContenuDocument.js.map