// src/middleware/authorize.ts (alternative)
import { Request, Response, NextFunction } from 'express';
import { RoleUtilisateur } from '../models/user/User';

const authorize = (allowedRoles: RoleUtilisateur[]) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error('allowedRoles must be an array');
  }

  return (req: Request, res: Response, next: NextFunction): void => {
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

export default authorize;