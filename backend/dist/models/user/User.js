"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/user/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const RoleUtilisateur = {
    ETUDIANT: "ETUDIANT",
    ENSEIGNANT: "ENSEIGNANT",
    ADMIN: "ADMIN",
};
const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(RoleUtilisateur),
        default: "ETUDIANT",
    },
    avatar: { type: String }, // Ajouté pour correspondre à Navbar.jsx
    level: {
        type: String,
        enum: ["ALFA", "BETA", "GAMMA", "DELTA"], // Aligné avec apprenantSchema
        default: "ALFA",
    },
    lastLogin: { type: Date },
    dateInscription: { type: Date, default: Date.now }, // Ajouté pour correspondre à la première version
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// Méthode pour mettre à jour le profil, reprise de la première version
userSchema.methods.mettreAJourProfil = async function (updates) {
    const allowedUpdates = ["nom", "prenom", "email", "avatar"];
    for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
            this[key] = value;
        }
    }
    await this.save();
    return this;
};
const User = mongoose.model("User", userSchema);
module.exports = { User, RoleUtilisateur };
//# sourceMappingURL=User.js.map