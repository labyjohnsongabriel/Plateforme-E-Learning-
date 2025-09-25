const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user/User");
const RoleUtilisateur = require("../../models/enums/RoleUtilisateur");

/**
 * @desc Inscription d'un nouvel utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Middleware suivant
 */
exports.register = async (req, res, next) => {
  try {
    const { email, motDePasse, nom, prenom, role } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      email,
      motDePasse, // Sera haché par le middleware pre-save
      nom,
      prenom,
      role: role || RoleUtilisateur.ETUDIANT, // Par défaut : étudiant
    });
    await user.save();

    // Générer un jeton JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Utilisateur enregistré", token });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Connexion d'un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Middleware suivant
 */
exports.login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Mettre à jour la dernière connexion
    user.dernierConnexion = new Date();
    await user.save();

    // Générer un jeton JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Connexion réussie", token });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
