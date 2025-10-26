import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../../models/user/User';
import { UserDocument } from '../../types';

// Response structure for profile endpoints
interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    prenom: string;
    nom: string;
    email: string;
    role: 'ETUDIANT' | 'ENSEIGNANT' | 'ADMIN';
    avatar: string | null;
    level: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA' | null;
    dateInscription?: string | undefined;
    statistics?: Record<string, any> | undefined;
    coursRecents?: Array<{ titre: string; progression: number }> | undefined;
  };
}

// Request body for updating profile
interface UpdateProfileRequestBody {
  nom?: string;
  prenom?: string;
  email?: string;
  avatar?: string;
}

class ProfileController {
  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        console.error('Utilisateur non authentifié: req.user manquant');
        res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        return;
      }

      if (!mongoose.isValidObjectId(req.user.id)) {
        console.error('ID utilisateur invalide:', req.user.id);
        res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
        return;
      }

      console.log('Récupération du profil pour user ID:', req.user.id);
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('progres') as UserDocument | null;

      if (!user) {
        console.error('Utilisateur non trouvé pour ID:', req.user.id);
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      const response: ProfileResponse = {
        success: true,
        message: 'Profil récupéré avec succès',
        data: {
          _id: user._id.toString(),
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          role: user.role,
          avatar: user.avatar || null,
          level: user.level || null,
          dateInscription: user.dateInscription ? user.dateInscription.toISOString() : undefined,
          statistics: user.statistics || {
            progression: 0,
            coursTermines: 0,
            coursInscrits: 0,
            certificats: 0,
            heuresEtude: 0,
          },
          coursRecents: user.progres?.map((prog: any) => ({
            titre: prog.titre || 'Cours inconnu',
            progression: prog.pourcentage || 0,
          })) || [],
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Erreur dans getProfile:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du profil',
        error: (error as Error).message,
      });
    }
  };

  static updateProfile = async (
    req: Request<{}, {}, UpdateProfileRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        console.error('Utilisateur non authentifié: req.user manquant');
        res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        return;
      }

      if (!mongoose.isValidObjectId(req.user.id)) {
        console.error('ID utilisateur invalide:', req.user.id);
        res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
        return;
      }

      console.log('Requête reçue pour updateProfile:', {
        body: req.body,
        file: req.file,
        headers: req.headers,
      });

      if (!req.body) {
        console.error('req.body est undefined');
        res.status(400).json({ success: false, message: 'Données du formulaire manquantes' });
        return;
      }

      const nom = req.body.nom as string | undefined;
      const prenom = req.body.prenom as string | undefined;
      const email = req.body.email as string | undefined;
      const avatar = req.file?.path;

      if (!nom || !prenom || !email) {
        console.error('Champs manquants:', { nom, prenom, email });
        res.status(400).json({ success: false, message: 'Les champs nom, prénom et email sont requis' });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('Email invalide:', email);
        res.status(400).json({ success: false, message: 'Email invalide' });
        return;
      }

      const updates: UpdateProfileRequestBody = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        ...(avatar && { avatar }),
      };

      console.log('Mise à jour du profil avec:', updates);

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      )
        .select('-password')
        .populate('progres') as UserDocument | null;

      if (!user) {
        console.error('Utilisateur non trouvé pour mise à jour, ID:', req.user.id);
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      const response: ProfileResponse = {
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          _id: user._id.toString(),
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          role: user.role,
          avatar: user.avatar || null,
          level: user.level || null,
          dateInscription: user.dateInscription ? user.dateInscription.toISOString() : undefined,
          statistics: user.statistics || {
            progression: 0,
            coursTermines: 0,
            coursInscrits: 0,
            certificats: 0,
            heuresEtude: 0,
          },
          coursRecents: user.progres?.map((prog: any) => ({
            titre: prog.titre || 'Cours inconnu',
            progression: prog.pourcentage || 0,
          })) || [],
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Erreur dans updateProfile:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        body: req.body,
        file: req.file,
      });

      let message = 'Erreur serveur lors de la mise à jour du profil';
      let status = 500;

      if ((error as any).code === 11000) {
        message = 'Cet email est déjà utilisé par un autre utilisateur';
        status = 400;
      } else if (error instanceof mongoose.Error.CastError) {
        message = 'ID utilisateur invalide';
        status = 400;
      } else if (error instanceof mongoose.Error.ValidationError) {
        //message = Object.values(error.errors)[0].message;
        status = 400;
      }

      res.status(status).json({
        success: false,
        message,
        error: (error as Error).message,
      });
    }
  };
}

export default ProfileController;