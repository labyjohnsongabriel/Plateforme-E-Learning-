"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../../utils/logger"));
const User_1 = require("../../models/user/User");
class AuthController {
}
_a = AuthController;
AuthController.register = async (req, res, next) => {
    try {
        const { nom, prenom, email, password } = req.body;
        logger_1.default.info('Received registration data:', { nom, prenom, email });
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            logger_1.default.warn('Email already used:', { email });
            res.status(400).json({
                errors: [{
                        type: 'field',
                        msg: 'Email déjà utilisé',
                        path: 'email',
                        location: 'body',
                    }],
            });
            return;
        }
        const user = new User_1.User({
            email,
            password,
            nom,
            prenom,
            role: User_1.RoleUtilisateur.ETUDIANT,
        });
        await user.save();
        if (!process.env.JWT_SECRET) {
            logger_1.default.error('JWT_SECRET non défini');
            res.status(500).json({
                errors: [{
                        type: 'server',
                        msg: 'Erreur serveur : configuration JWT manquante',
                        path: '',
                        location: 'server',
                    }],
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'Utilisateur enregistré', token });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const errors = Object.values(error.errors).map(err => ({
                type: 'field',
                msg: err.message,
                path: err.path,
                location: 'body',
            }));
            logger_1.default.error('Mongoose validation errors:', { errors, body: req.body });
            res.status(400).json({ errors });
            return;
        }
        logger_1.default.error('Registration error:', { message: error.message, stack: error.stack });
        next(error);
    }
};
AuthController.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        logger_1.default.info('Received login data:', { email });
        const user = await User_1.User.findOne({ email });
        if (!user) {
            logger_1.default.warn('User not found:', { email });
            res.status(401).json({
                errors: [{
                        type: 'field',
                        msg: 'Identifiants invalides',
                        path: 'email',
                        location: 'body',
                    }],
            });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger_1.default.warn('Invalid password for:', { email });
            res.status(401).json({
                errors: [{
                        type: 'field',
                        msg: 'Identifiants invalides',
                        path: 'password',
                        location: 'body',
                    }],
            });
            return;
        }
        user.lastLogin = new Date();
        await user.save();
        if (!process.env.JWT_SECRET) {
            logger_1.default.error('JWT_SECRET non défini');
            res.status(500).json({
                errors: [{
                        type: 'server',
                        msg: 'Erreur serveur : configuration JWT manquante',
                        path: '',
                        location: 'server',
                    }],
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
        logger_1.default.error('Login error:', { message: error.message, stack: error.stack });
        next(error);
    }
};
AuthController.getMe = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user?.id).select('-password');
        if (!user) {
            logger_1.default.warn('User not found:', { userId: req.user?.id });
            res.status(404).json({
                errors: [{
                        type: 'field',
                        msg: 'Utilisateur non trouvé',
                        path: 'id',
                        location: 'user',
                    }],
            });
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
        logger_1.default.error('Error in getMe:', { message: error.message, stack: error.stack });
        res.status(500).json({
            errors: [{
                    type: 'server',
                    msg: 'Erreur serveur',
                    path: '',
                    location: 'server',
                }],
        });
    }
};
exports.default = AuthController;
//# sourceMappingURL=AuthController.js.map