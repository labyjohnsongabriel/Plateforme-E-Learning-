import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
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

interface ForgotPasswordRequestBody {
  email: string;
}

interface ResetPasswordRequestBody {
  token: string;
  newPassword: string;
}

// Configuration de Nodemailer pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Remplacez par votre service d'email (SendGrid, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Ajoutez dans .env
    pass: process.env.EMAIL_PASS, // Ajoutez dans .env
  },
});

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

  static forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;
      logger.info('Received forgot password request:', { email });

      // Vérifier les variables d'environnement
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

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.FRONTEND_URL) {
        logger.error('Missing email configuration', {
          emailUser: !!process.env.EMAIL_USER,
          emailPass: !!process.env.EMAIL_PASS,
          frontendUrl: !!process.env.FRONTEND_URL,
        });
        res.status(500).json({
          errors: [{
            type: 'server',
            msg: 'Erreur serveur : configuration email manquante',
            path: '',
            location: 'server',
          }],
        });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('User not found for forgot password:', { email });
        res.status(404).json({
          errors: [{
            type: 'field',
            msg: 'Utilisateur non trouvé',
            path: 'email',
            location: 'body',
          }],
        });
        return;
      }

      // Générer un token de réinitialisation
      const resetToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Sauvegarder le token et sa date d'expiration
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // Expire dans 1 heure
      await user.save();

      // Envoyer l'email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <p>Vous avez demandé une réinitialisation de mot de passe.</p>
          <p>Cliquez sur ce <a href="${resetUrl}">lien</a> pour réinitialiser votre mot de passe.</p>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
        `,
      };

      await transporter.sendMail(mailOptions).catch((error: Error) => {
        logger.error('Failed to send reset password email:', {
          message: error.message,
          stack: error.stack,
          email,
        });
        throw new Error('Erreur lors de l’envoi de l’email de réinitialisation');
      });

      logger.info('Reset password email sent:', { email });

      res.status(200).json({
        message: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
      });
    } catch (error) {
      logger.error('Forgot password error:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        email: req.body.email,
      });
      res.status(500).json({
        errors: [{
          type: 'server',
          msg: 'Erreur serveur lors de la demande de réinitialisation',
          path: '',
          location: 'server',
        }],
      });
    }
  };

  static resetPassword = async (
    req: Request<{}, {}, ResetPasswordRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      logger.info('Received reset password request');

      // Vérifier le token
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

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; email: string };
      } catch (error) {
        logger.warn('Invalid or expired reset token');
        res.status(400).json({
          errors: [{
            type: 'field',
            msg: 'Token invalide ou expiré',
            path: 'token',
            location: 'body',
          }],
        });
        return;
      }

      const user = await User.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        logger.warn('Invalid reset token or user not found:', { userId: decoded.id });
        res.status(400).json({
          errors: [{
            type: 'field',
            msg: 'Token invalide ou expiré',
            path: 'token',
            location: 'body',
          }],
        });
        return;
      }

      // Mettre à jour le mot de passe
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.info('Password reset successful:', { email: user.email });
      res.status(200).json({
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      logger.error('Reset password error:', { message: (error as Error).message, stack: (error as Error).stack });
      res.status(500).json({
        errors: [{
          type: 'server',
          msg: 'Erreur serveur lors de la réinitialisation du mot de passe',
          path: '',
          location: 'server',
        }],
      });
    }
  };
}

export default AuthController;