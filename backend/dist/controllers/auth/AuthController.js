"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../models/user/User");
const types_1 = require("../../types");
class AuthController {
}
_a = AuthController;
AuthController.register = async (req, res, next) => {
    try {
        const { nom, prenom, email, password } = req.body;
        // Log received data for debugging
        console.log('Received registration data:', { nom, prenom, email, password });
        // Validate input
        if (!nom || !prenom || !email || !password) {
            res.status(400).json({
                message: 'Tous les champs (nom, prenom, email, motDePasse) sont requis',
                missingFields: {
                    nom: !nom,
                    prenom: !prenom,
                    email: !email,
                    password: !password,
                },
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Format d\'email invalide' });
            return;
        }
        // Check if user exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email déjà utilisé' });
            return;
        }
        // Create new user
        const user = new User_1.User({
            email,
            password,
            nom,
            prenom,
            role: User_1.RoleUtilisateur.ETUDIANT,
        });
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(201).json({ message: 'Utilisateur enregistré', token });
    }
    catch (error) {
        console.error('Registration error:', error.message);
        next(error);
    }
};
AuthController.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis' });
            return;
        }
        // Find user
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Identifiants invalides' });
            return;
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Identifiants invalides' });
            return;
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        // Return user data along with token
        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                _id: user._id,
                prenom: user.prenom,
                nom: user.nom,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error.message);
        next(error);
    }
};
AuthController.getMe = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware (contains id and role from JWT)
        const user = await User_1.User.findById(req.user?.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.json({
            _id: user._id,
            prenom: user.prenom,
            nom: user.nom,
            email: user.email,
            role: user.role,
        });
    }
    catch (error) {
        console.error('Error in getMe:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.default = AuthController;
//# sourceMappingURL=AuthController.js.map