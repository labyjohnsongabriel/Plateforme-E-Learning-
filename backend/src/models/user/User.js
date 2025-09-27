// models/user/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Enum pour les rôles, aligné avec AuthController.js
const RoleUtilisateur = {
  ETUDIANT: 'ETUDIANT',
  ADMIN: 'ADMIN',
};

// Schéma de base pour Utilisateur
const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true }, // Added prenom to match AuthController
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    dateInscription: { type: Date, default: Date.now },
    role: {
      type: String,
      enum: Object.values(RoleUtilisateur),
      required: true,
    },
    lastLogin: { type: Date }, // Added to match AuthController
  },
  { discriminatorKey: 'role', timestamps: true }
);

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Méthode pour authentifier l'utilisateur
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Renamed to match AuthController
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour mettre à jour le profil
userSchema.methods.mettreAJourProfil = async function (updates) {
  const allowedUpdates = ['nom', 'prenom', 'email'];
  for (const [key, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(key)) {
      this[key] = value;
    }
  }
  await this.save();
  return this;
};

// Schéma pour Apprenant
const apprenantSchema = new mongoose.Schema({
  niveauActuel: {
    type: String,
    enum: ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
    default: 'ALFA',
  },
});

// Méthodes spécifiques à Apprenant
apprenantSchema.methods.suivreCours = async function (coursId) {
  const Inscription = mongoose.model('Inscription');
  const inscription = new Inscription({
    utilisateur: this._id,
    cours: coursId,
    dateDebut: new Date(),
    statut: 'EN_COURS',
  });
  await inscription.save();
  return inscription;
};

apprenantSchema.methods.visualiserProgres = async function () {
  const Progression = mongoose.model('Progression');
  const progressions = await Progression.find({
    utilisateur: this._id,
  }).populate('cours');
  return progressions;
};

// Schéma pour Administrateur
const administrateurSchema = new mongoose.Schema({});

// Méthodes spécifiques à Administrateur
administrateurSchema.methods.gererUtilisateurs = async function () {
  const User = mongoose.model('User');
  return User.find({});
};

administrateurSchema.methods.genererStatistiques = async function () {
  const Progression = mongoose.model('Progression');
  const stats = await Progression.aggregate([
    {
      $group: {
        _id: '$niveauActuel',
        total: { $sum: 1 },
        avancementMoyen: { $avg: '$avancement' },
      },
    },
  ]);
  return stats;
};

// Modèle principal et discriminateurs
const User = mongoose.model('User', userSchema);
const Apprenant = User.discriminator('ETUDIANT', apprenantSchema); // Updated to ETUDIANT
const Administrateur = User.discriminator('ADMIN', administrateurSchema);

module.exports = { User, Apprenant, Administrateur, RoleUtilisateur };