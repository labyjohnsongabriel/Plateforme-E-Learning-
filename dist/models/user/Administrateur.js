"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Administrateur = void 0;
// src/models/user/Administrateur.ts
const mongoose_1 = require("mongoose");
const User_1 = require("./User");
// Schéma pour le discriminateur Administrateur
const administrateurSchema = new mongoose_1.Schema({});
// Discriminateur pour Administrateur
exports.Administrateur = User_1.User.discriminator('Administrateur', administrateurSchema);
//# sourceMappingURL=Administrateur.js.map