"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Administrateur = exports.Apprenant = exports.User = exports.RoleUtilisateur = void 0;
// src/models/user/User.ts
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_2 = __importDefault(require("mongoose"));
// Enum pour les rôles utilisateur
var RoleUtilisateur;
(function (RoleUtilisateur) {
    RoleUtilisateur["ETUDIANT"] = "ETUDIANT";
    RoleUtilisateur["ENSEIGNANT"] = "ENSEIGNANT";
    RoleUtilisateur["ADMIN"] = "ADMIN";
})(RoleUtilisateur || (exports.RoleUtilisateur = RoleUtilisateur = {}));
// Schéma pour User
const userSchema = new mongoose_1.Schema({
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
        default: RoleUtilisateur.ETUDIANT,
    },
    avatar: { type: String, required: false },
    level: {
        type: String,
        enum: ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
        default: 'ALFA',
    },
    lastLogin: { type: Date, required: false },
    dateInscription: { type: Date, default: Date.now, required: true },
}, { timestamps: true, discriminatorKey: 'role' });
// Middleware pour hacher le mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt_1.default.hash(this.password, 10);
    }
    next();
});
// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function (password) {
    return bcrypt_1.default.compare(password, this.password);
};
// Méthode pour mettre à jour le profil
userSchema.methods.mettreAJourProfil = async function (updates) {
    const allowedUpdates = ['nom', 'prenom', 'email', 'avatar'];
    for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
            this[key] = value; // Workaround for TypeScript strict property assignment
        }
    }
    await this.save();
    return this;
};
// Schéma pour le discriminateur Apprenant
const apprenantSchema = new mongoose_1.Schema({});
// Méthode pour visualiser le progrès
apprenantSchema.methods.visualiserProgres = async function () {
    const certificats = await mongoose_2.default.model('Certificat').find({ utilisateur: this._id });
    return { certificatsCount: certificats.length, completed: certificats.length > 0 };
};
// Schéma pour le discriminateur Administrateur
const administrateurSchema = new mongoose_1.Schema({});
// Méthode pour gérer les utilisateurs
administrateurSchema.methods.gererUtilisateurs = async function () {
    return User.find({ role: { $ne: RoleUtilisateur.ADMIN } }); // Exclure les admins
};
// Méthode pour générer des statistiques
administrateurSchema.methods.genererStatistiques = async function () {
    const totalUsers = await User.countDocuments();
    const etudiants = await User.countDocuments({ role: RoleUtilisateur.ETUDIANT });
    return { totalUsers, etudiants };
};
// Modèle User et discriminateurs
const User = (0, mongoose_1.model)('User', userSchema);
exports.User = User;
const Apprenant = User.discriminator('Apprenant', apprenantSchema, RoleUtilisateur.ETUDIANT);
exports.Apprenant = Apprenant;
const Administrateur = User.discriminator('Administrateur', administrateurSchema, RoleUtilisateur.ADMIN);
exports.Administrateur = Administrateur;
//# sourceMappingURL=User.js.map