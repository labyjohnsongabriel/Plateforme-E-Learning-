"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // Récupérer l'en-tête Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // Vérifier si l'en-tête existe et commence par 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Aucun jeton fourni' });
        return;
    }
    // Extraire le jeton
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || !parts[1]) {
        res.status(401).json({ message: 'Format de jeton invalide' });
        return;
    }
    const token = parts[1]; // TypeScript now infers this as string due to the check
    // Récupérer la clé secrète
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('JWT_SECRET non défini dans les variables d\'environnement');
        res.status(500).json({ message: 'Erreur serveur : configuration manquante' });
        return;
    }
    try {
        // Vérifier et décoder le jeton
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        if (!decoded.id || !decoded.role) {
            res.status(401).json({ message: 'Jeton invalide : données manquantes' });
            return;
        }
        req.user = {
            id: decoded.id,
            role: decoded.role, // Assurer que role est de type RoleUtilisateur
        };
        next();
    }
    catch (error) {
        console.error('Erreur de vérification du jeton :', error.message);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Jeton expiré' });
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Jeton invalide' });
            return;
        }
        res.status(401).json({ message: 'Erreur d\'authentification' });
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.js.map