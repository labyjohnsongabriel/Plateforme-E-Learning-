import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, RoleUtilisateur } from '../../models/user/User';
import { UserDocument } from '../../types';

interface RegisterRequestBody {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

class AuthController {
  static register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nom, prenom, email, password } = req.body;

      // Log received data for debugging
      console.log('Received registration data:', { nom, prenom, email, password });

      // Validate input
      if (!nom || !prenom || !email || !password) {
        res.status(400).json({
          message: 'Tous les champs (nom, prenom, email, motDePasse) sont requis',
          missingFields: {
            nom: !nom,
            prenom: !prenom,
            email: !email,
            password: !password,
          },
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Format d\'email invalide' });
        return;
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'Email déjà utilisé' });
        return;
      }

      // Create new user
      const user = new User({
        email,
        password,
        nom,
        prenom,
        role: RoleUtilisateur.ETUDIANT,
      });
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      res.status(201).json({ message: 'Utilisateur enregistré', token });
    } catch (error) {
      console.error('Registration error:', (error as Error).message);
      next(error);
    }
  };

  static login = async (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ message: 'Email et mot de passe requis' });
        return;
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      // Return user data along with token
      res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: {
          _id: user._id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', (error as Error).message);
      next(error);
    }
  };

  static getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is set by authMiddleware (contains id and role from JWT)
      const user = await User.findById(req.user?.id).select('-password');
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      res.json({
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Error in getMe:', (error as Error).message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
}

export default AuthController;
