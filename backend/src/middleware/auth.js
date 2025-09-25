const jwt = require("jsonwebtoken");

/**
 * @desc Middleware d'authentification JWT
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Middleware suivant
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Aucun jeton fourni" });
  }

  const token = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET || "your_jwt_secret";

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attache l'ID utilisateur (req.user.id)
    next();
  } catch (error) {
    res.status(401).json({ message: "Jeton invalide ou expiré" });
  }
};
