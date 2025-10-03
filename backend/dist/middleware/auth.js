"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/auth.js
const jwt = require("jsonwebtoken");
/**
 * @desc Middleware d'authentification JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Middleware suivant
 */
const authMiddleware = (req, res, next) => {
    // Récupérer l'en-tête Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization; // Supporte 'Authorization' et 'authorization'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Aucun jeton fourni" });
    }
    // Extraire le jeton
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Format de jeton invalide" });
    }
    // Récupérer la clé secrète
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error("JWT_SECRET non défini dans les variables d'environnement");
        return res
            .status(500)
            .json({ message: "Erreur serveur : configuration manquante" });
    }
    try {
        // Vérifier et décoder le jeton
        const decoded = jwt.verify(token, secretKey);
        if (!decoded.id || !decoded.role) {
            return res
                .status(401)
                .json({ message: "Jeton invalide : données manquantes" });
        }
        req.user = decoded; // Attache les données décodées (id, role) à req.user
        next();
    }
    catch (error) {
        console.error("Erreur de vérification du jeton :", error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Jeton expiré" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Jeton invalide" });
        }
        return res.status(401).json({ message: "Erreur d'authentification" });
    }
};
module.exports = authMiddleware;
//# sourceMappingURL=auth.js.map