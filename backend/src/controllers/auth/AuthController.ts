import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import logger from '../../utils/logger';
import { User, RoleUtilisateur } from '../../models/user/User';

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
    logger.info('Raw request body:', req.body); // Log pour débogage
    try {
      const { nom, prenom, email, password } = req.body;
      logger.info('Received registration data:', { nom, prenom, email });
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn('Email already used:', { email });
        res.status(400).json({
          errors: [{
            type: 'field',
            msg: 'Email déjà utilisé',
            path: 'email',
            location: 'body',
          }],
        });
        return;
      }
      const user = new User({
        email,
        password,
        nom,
        prenom,
        role: RoleUtilisateur.ETUDIANT,
      });
      await user.save();
      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET non défini');
        res.status(500).json({
          errors: [{
            type: 'server',
            msg: 'Erreur serveur : configuration JWT manquante',
            path: '',
            location: 'server',
          }],
        });
        return;
      }
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(201).json({ message: 'Utilisateur enregistré', token });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map(err => ({
          type: 'field',
          msg: err.message,
          path: err.path,
          location: 'body',
        }));
        logger.error('Mongoose validation errors:', { errors, body: req.body });
        res.status(400).json({ errors });
        return;
      }
      logger.error('Registration error:', { message: (error as Error).message, stack: (error as Error).stack });
      next(error);
    }
  };

  static login = async (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    logger.info('Raw request body:', req.body); // Log pour débogage
    try {
      const { email, password } = req.body;
      logger.info('Received login data:', { email });
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('User not found:', { email });
        res.status(401).json({
          errors: [{
            type: 'field',
            msg: 'Identifiants invalides',
            path: 'email',
            location: 'body',
          }],
        });
        return;
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn('Invalid password for:', { email });
        res.status(401).json({
          errors: [{
            type: 'field',
            msg: 'Identifiants invalides',
            path: 'password',
            location: 'body',
          }],
        });
        return;
      }
      user.lastLogin = new Date();
      await user.save();
      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET non défini');
        res.status(500).json({
          errors: [{
            type: 'server',
            msg: 'Erreur serveur : configuration JWT manquante',
            path: '',
            location: 'server',
          }],
        });
        return;
      }
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
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
      logger.error('Login error:', { message: (error as Error).message, stack: (error as Error).stack });
      next(error);
    }
  };

  static getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.user?.id).select('-password');
      if (!user) {
        logger.warn('User not found:', { userId: req.user?.id });
        res.status(404).json({
          errors: [{
            type: 'field',
            msg: 'Utilisateur non trouvé',
            path: 'id',
            location: 'user',
          }],
        });
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
      logger.error('Error in getMe:', { message: (error as Error).message, stack: (error as Error).stack });
      res.status(500).json({
        errors: [{
          type: 'server',
          msg: 'Erreur serveur',
          path: '',
          location: 'server',
        }],
      });
    }
  };
}

export default AuthController;