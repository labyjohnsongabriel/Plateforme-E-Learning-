"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorize = (allowedRoles) => {
    if (!Array.isArray(allowedRoles)) {
        throw new Error('allowedRoles must be an array');
    }
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'Accès refusé' });
            return;
        }
        next();
    };
};
exports.default = authorize;
//# sourceMappingURL=authorization.js.map