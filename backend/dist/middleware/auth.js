"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = (req.headers.authorization || req.headers.Authorization);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Aucun jeton fourni' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Format du jeton invalide' });
        return;
    }
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error('❌ JWT_SECRET non défini dans le fichier .env');
        res.status(500).json({ message: 'Erreur serveur : configuration JWT manquante' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
            res.status(401).json({ message: 'Jeton invalide : données manquantes' });
            return;
        }
        // ✅ Correction du typage ici
        req.user = {
            _id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
        console.error('Erreur de vérification du jeton :', error.message);
        res.status(401).json({
            message: error.name === 'TokenExpiredError' ? 'Jeton expiré' : 'Jeton invalide',
        });
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.js.map