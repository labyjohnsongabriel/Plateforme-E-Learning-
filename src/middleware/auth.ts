// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RoleUtilisateur } from '../models/user/User'; // Import RoleUtilisateur pour typer req.user.role

/**
 * @desc Middleware d'authentification JWT
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Middleware suivant
 */
interface CustomRequest extends Request {
  user?: {
    id: string;
    role: RoleUtilisateur;
  };
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  // Récupérer l'en-tête Authorization
  const authHeader: string | undefined = req.headers.authorization || req.headers.Authorization as string | undefined;

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
  const token: string = parts[1]; // TypeScript now infers this as string due to the check

  // Récupérer la clé secrète
  const secretKey: string | undefined = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error('JWT_SECRET non défini dans les variables d\'environnement');
    res.status(500).json({ message: 'Erreur serveur : configuration manquante' });
    return;
  }

  try {
    // Vérifier et décoder le jeton
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    if (!decoded.id || !decoded.role) {
      res.status(401).json({ message: 'Jeton invalide : données manquantes' });
      return;
    }
    req.user = {
      id: decoded.id,
      role: decoded.role as RoleUtilisateur, // Assurer que role est de type RoleUtilisateur
    };
    next();
  } catch (error: any) {
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

export default authMiddleware;