// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import createError from 'http-errors';
import { UserDocument, RoleUtilisateur } from '../types';
import logger from '../utils/logger';

declare module 'express-serve-static-core' {
  interface Request {
    user?: Partial<UserDocument>;
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Aucun jeton fourni' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Format du jeton invalide' });

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) return res.status(500).json({ message: 'Configuration JWT manquante' });

    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
      return res.status(401).json({ message: 'Jeton invalide : données manquantes' });
    }

    req.user = {
      _id: decoded.id,
      id: decoded.id, // ⚡ ajouter id pour compatibilité avec getMyCourses
      role: decoded.role as RoleUtilisateur,
      email: decoded.email,
    };

    logger.info('Utilisateur authentifié', { user: req.user });
    next();
  } catch (error: any) {
    logger.error('Erreur auth:', error.message);
    res.status(401).json({
      message: error.name === 'TokenExpiredError' ? 'Jeton expiré' : 'Jeton invalide',
    });
  }
};

export default authMiddleware;
