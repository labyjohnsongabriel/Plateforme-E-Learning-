// controllers/auth/AuthController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, RoleUtilisateur } = require("../../models/user/User");

console.log("User model:", User);

exports.register = async (req, res, next) => {
  try {
    const { nom, prenom, email, password } = req.body;

    // Log received data for debugging
    console.log("Received registration data:", {
      nom,
      prenom,
      email,
      password,
    });

    // Validate input
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs (nom, prenom, email, motDePasse) sont requis",
        missingFields: {
          nom: !nom,
          prenom: !prenom,
          email: !email,
          password: !password,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Create new user
    const user = new User({
      email,
      password, // Updated to match schema
      nom,
      prenom,
      role: RoleUtilisateur.ETUDIANT,
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Utilisateur enregistré", token });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return user data along with token
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware (contains id and role from JWT)
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({
      _id: user._id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = exports;
