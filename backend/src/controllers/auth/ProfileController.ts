import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/user/User';
import { UserDocument } from '../../types';

interface ProfileResponse {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  avatar: string | null;
  level: string | null;
}

interface UpdateProfileRequestBody {
  [key: string]: any; // Peut être typé plus précisément si vous connaissez les champs autorisés
}

class ProfileController {
  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      console.log('Récupération du profil pour user ID:', req.user.id);
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }

      const response: ProfileResponse = {
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        level: user.level || null,
      };

      res.json({ data: response });
    } catch (error) {
      console.error('Erreur dans getProfile:', (error as Error).message);
      res.status(500).json({
        message: 'Erreur serveur lors de la récupération du profil',
        error: (error as Error).message,
      });
    }
  };

  static updateProfile = async (req: Request<{}, {}, UpdateProfileRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const updates = req.body;
      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!user) {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
        return;
      }

      const response: ProfileResponse = {
        _id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        level: user.level || null,
      };

      res.json({ data: response });
    } catch (error) {
      console.error('Erreur dans updateProfile:', (error as Error).message);
      res.status(500).json({
        message: 'Erreur serveur lors de la mise à jour du profil',
        error: (error as Error).message,
      });
    }
  };
}

export default ProfileController;