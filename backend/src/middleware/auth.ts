import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RoleUtilisateur, UserDocument } from '../types';

// ✅ Étendre Express.Request pour inclure req.user
declare module 'express-serve-static-core' {
  interface Request {
    user?: Partial<UserDocument>;
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;

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
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.role) {
      res.status(401).json({ message: 'Jeton invalide : données manquantes' });
      return;
    }

    // ✅ Correction du typage ici
    req.user = {
      _id: decoded.id,
      role: decoded.role as RoleUtilisateur,
      email: decoded.email,
    } as Partial<UserDocument>;

    next();
  } catch (error: any) {
    console.error('Erreur de vérification du jeton :', error.message);
    res.status(401).json({
      message: error.name === 'TokenExpiredError' ? 'Jeton expiré' : 'Jeton invalide',
    });
  }
};

export default authMiddleware;