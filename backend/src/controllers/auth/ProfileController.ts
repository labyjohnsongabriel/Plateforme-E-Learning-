import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../../models/user/User';
import { UserDocument } from '../../types';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

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
    photo: string | null;
    photoUrl: string | null;
    level: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA' | null;
    status?: string;
    accountStatus?: string;
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
  /**
   * Construire l'URL complète de l'avatar
   */
  private static buildAvatarUrl(req: Request, avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    
    // Si c'est déjà une URL complète
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    
    // Construire l'URL complète
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Nettoyer le chemin
    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Récupérer le profil utilisateur
   */
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

      // Construire les URLs complètes pour les avatars
      const avatarUrl = this.buildAvatarUrl(req, user.avatar);

      const response: ProfileResponse = {
        success: true,
        message: 'Profil récupéré avec succès',
        data: {
          _id: user._id.toString(),
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          role: user.role,
          avatar: avatarUrl,
          photo: avatarUrl, // Alias pour compatibilité
          photoUrl: avatarUrl, // Alias pour compatibilité
          level: user.level || null,
          status: (user as any).status || 'active',
          accountStatus: (user as any).accountStatus || (user as any).status || 'active',
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

      console.log('Profil récupéré avec succès:', {
        userId: user._id,
        hasAvatar: !!avatarUrl,
        avatarUrl,
      });

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

  /**
   * Mettre à jour le profil utilisateur
   */
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
        userId: req.user.id,
      });

      if (!req.body) {
        console.error('req.body est undefined');
        res.status(400).json({ success: false, message: 'Données du formulaire manquantes' });
        return;
      }

      const nom = req.body.nom as string | undefined;
      const prenom = req.body.prenom as string | undefined;
      const email = req.body.email as string | undefined;

      // Validation des champs requis
      if (!nom || !prenom || !email) {
        console.error('Champs manquants:', { nom, prenom, email });
        res.status(400).json({ 
          success: false, 
          message: 'Les champs nom, prénom et email sont requis' 
        });
        return;
      }

      // Validation email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('Email invalide:', email);
        res.status(400).json({ success: false, message: 'Email invalide' });
        return;
      }

      // Préparer les updates
      const updates: any = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
      };

      // Gérer l'upload d'avatar si présent
      if (req.file) {
        try {
          const user = await User.findById(req.user.id);
          
          // Supprimer l'ancien avatar s'il existe
          if (user && user.avatar) {
            const oldAvatarPath = path.join(__dirname, '../../../uploads/avatars', path.basename(user.avatar));
            try {
              await fs.unlink(oldAvatarPath);
              console.log('Ancien avatar supprimé:', oldAvatarPath);
            } catch (err) {
              console.log('Ancien avatar non trouvé ou déjà supprimé');
            }
          }

          // Optimiser l'image avec Sharp
          const optimizedFilename = `optimized-${req.file.filename}`;
          const optimizedPath = path.join(path.dirname(req.file.path), optimizedFilename);

          await sharp(req.file.path)
            .resize(400, 400, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({ quality: 85 })
            .toFile(optimizedPath);

          // Supprimer l'image originale
          await fs.unlink(req.file.path);

          // Stocker uniquement le chemin relatif
          updates.avatar = `/uploads/avatars/${optimizedFilename}`;

          console.log('Avatar optimisé et sauvegardé:', updates.avatar);
        } catch (uploadError) {
          console.error('Erreur traitement avatar:', uploadError);
          // Ne pas bloquer la mise à jour du profil si l'upload échoue
        }
      }

      console.log('Mise à jour du profil avec:', updates);

      // Mettre à jour l'utilisateur
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

      // Construire les URLs complètes
      const avatarUrl = this.buildAvatarUrl(req, user.avatar);

      const response: ProfileResponse = {
        success: true,
        message: 'Profil mis à jour avec succès',
        data: {
          _id: user._id.toString(),
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          role: user.role,
          avatar: avatarUrl,
          photo: avatarUrl,
          photoUrl: avatarUrl,
          level: user.level || null,
          status: (user as any).status || 'active',
          accountStatus: (user as any).accountStatus || (user as any).status || 'active',
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

      console.log('Profil mis à jour avec succès:', {
        userId: user._id,
        hasAvatar: !!avatarUrl,
      });

      res.json(response);
    } catch (error) {
      console.error('Erreur dans updateProfile:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        body: req.body,
        file: req.file,
      });

      // Nettoyer le fichier en cas d'erreur
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
          console.log('Fichier temporaire supprimé après erreur');
        } catch (cleanupError) {
          console.error('Erreur nettoyage fichier temporaire:', cleanupError);
        }
      }

      let message = 'Erreur serveur lors de la mise à jour du profil';
      let status = 500;

      if ((error as any).code === 11000) {
        message = 'Cet email est déjà utilisé par un autre utilisateur';
        status = 400;
      } else if (error instanceof mongoose.Error.CastError) {
        message = 'ID utilisateur invalide';
        status = 400;
      } else if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        message = validationErrors.join(', ');
        status = 400;
      }

      res.status(status).json({
        success: false,
        message,
        error: (error as Error).message,
      });
    }
  };

  /**
   * Supprimer l'avatar utilisateur
   */
  static deleteAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        return;
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      if (!user.avatar) {
        res.status(400).json({ success: false, message: 'Aucun avatar à supprimer' });
        return;
      }

      // Supprimer le fichier physique
      const avatarPath = path.join(__dirname, '../../../uploads/avatars', path.basename(user.avatar));
      try {
        await fs.unlink(avatarPath);
        console.log('Avatar supprimé:', avatarPath);
      } catch (err) {
        console.log('Fichier avatar non trouvé');
      }

      // CORRECTION : Utiliser une chaîne vide au lieu de null
      // Mettre à jour l'utilisateur
      user.avatar = '';
      await user.save();

      res.json({
        success: true,
        message: 'Avatar supprimé avec succès',
      });
    } catch (error) {
      console.error('Erreur dans deleteAvatar:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'avatar',
        error: (error as Error).message,
      });
    }
  };

  /**
   * Obtenir les statistiques du profil
   */
  static getProfileStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
        return;
      }

      const user = await User.findById(req.user.id)
        .populate('progres')
        .select('-password') as UserDocument | null;

      if (!user) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      const stats = {
        totalCourses: user.progres?.length || 0,
        completedCourses: user.statistics?.coursTermines || 0,
        inProgressCourses: (user.progres?.length || 0) - (user.statistics?.coursTermines || 0),
        certificates: user.statistics?.certificats || 0,
        level: user.level || 'ALFA',
        progression: user.statistics?.progression || 0,
        heuresEtude: user.statistics?.heuresEtude || 0,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Erreur dans getProfileStats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: (error as Error).message,
      });
    }
  };
}

export default ProfileController;