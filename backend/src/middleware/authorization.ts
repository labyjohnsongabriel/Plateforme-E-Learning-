import { Request, Response, NextFunction } from 'express';
import { RoleUtilisateur } from '../types';

const authorizationMiddleware = (allowedRoles: RoleUtilisateur[]) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error('allowedRoles must be an array');
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const userRole = req.user.role as RoleUtilisateur;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    next();
  };
};

export default authorizationMiddleware;