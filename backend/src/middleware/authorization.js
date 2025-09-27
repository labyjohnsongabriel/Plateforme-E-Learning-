module.exports = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error("allowedRoles must be an array");
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    next();
  };
};