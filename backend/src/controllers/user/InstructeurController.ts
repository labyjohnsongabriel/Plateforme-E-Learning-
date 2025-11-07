// src/controllers/user/InstructeurController.ts - VERSION COMPLÈTEMENT CORRIGÉE
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import mongoose, { Types } from 'mongoose';
import { User } from '../../models/user/User';
import Cours from '../../models/course/Cours';
import Domaine from '../../models/course/Domaine';
import {
  UserDocument,
  CourseDocument,
  RoleUtilisateur,
} from '../../types';

class InstructeurController {
  // === MÉTHODE POUR COMPTER TOUS LES ÉTUDIANTS INSCRITS ===
  static getTotalStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔄 Début du comptage de tous les étudiants inscrits...');
      
      // Vérifier les permissions
      if (!req.user) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      const userRole = req.user.role;
      const userId = req.user.id;

      // Seuls les ADMIN et ENSEIGNANT peuvent accéder
      if (userRole !== RoleUtilisateur.ADMIN && userRole !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(403, 'Accès non autorisé. Rôle insuffisant.');
      }

      let totalStudents = 0;

      if (userRole === RoleUtilisateur.ADMIN) {
        // ADMIN: compter tous les étudiants inscrits à tous les cours
        const result = await Cours.aggregate([
          // Étape 1: Filtrer les cours qui ont des étudiants inscrits
          { 
            $match: { 
              'etudiantsInscrits': { 
                $exists: true, 
                $ne: [], 
                $not: { $size: 0 } 
              } 
            } 
          },
          
          // Étape 2: Dérouler le tableau des étudiants inscrits
          { $unwind: '$etudiantsInscrits' },
          
          // Étape 3: Grouper par ID d'étudiant pour éliminer les doublons
          { 
            $group: {
              _id: '$etudiantsInscrits._id'
            }
          },
          
          // Étape 4: Compter les étudiants uniques
          { 
            $count: 'totalStudents' 
          }
        ]);

        totalStudents = result.length > 0 ? result[0].totalStudents : 0;
        console.log(`✅ ADMIN - Nombre total d'étudiants inscrits: ${totalStudents}`);

      } else if (userRole === RoleUtilisateur.ENSEIGNANT) {
        // ENSEIGNANT: compter seulement ses propres étudiants
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          throw createError(400, 'ID instructeur invalide');
        }

        const result = await Cours.aggregate([
          // Étape 1: Filtrer les cours de cet instructeur avec étudiants
          { 
            $match: { 
              instructeurId: new mongoose.Types.ObjectId(userId),
              'etudiantsInscrits': { 
                $exists: true, 
                $ne: [], 
                $not: { $size: 0 } 
              } 
            } 
          },
          
          // Étape 2: Dérouler le tableau des étudiants
          { $unwind: '$etudiantsInscrits' },
          
          // Étape 3: Grouper par ID d'étudiant
          { 
            $group: {
              _id: '$etudiantsInscrits._id'
            }
          },
          
          // Étape 4: Compter
          { 
            $count: 'totalStudents' 
          }
        ]);

        totalStudents = result.length > 0 ? result[0].totalStudents : 0;
        console.log(`✅ ENSEIGNANT ${userId} - Étudiants inscrits: ${totalStudents}`);
      }

      res.json({
        success: true,
        data: {
          totalStudents: totalStudents,
          userRole: userRole,
          timestamp: new Date().toISOString()
        },
        message: `Nombre total d'étudiants inscrits: ${totalStudents}`
      });

    } catch (err) {
      console.error('❌ Erreur dans getTotalStudents:', err);
      next(createError(500, 'Erreur lors du comptage des étudiants'));
    }
  };

  // === MÉTHODE POUR COMPTER LES ÉTUDIANTS PAR INSTRUCTEUR SPÉCIFIQUE ===
  static getTotalStudentsByInstructor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      console.log(`🔄 Comptage des étudiants pour l'instructeur: ${id}`);

      // Vérifications de sécurité
      if (!req.user) {
        throw createError(401, 'Utilisateur non authentifié');
      }

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const userRole = req.user.role;
      const userId = req.user.id;

      // Vérifier les permissions: ADMIN ou l'enseignant lui-même
      if (userRole !== RoleUtilisateur.ADMIN && userId !== id) {
        throw createError(403, 'Accès non autorisé. Vous ne pouvez voir que vos propres statistiques.');
      }

      // Vérifier que l'instructeur existe
      const instructeur = await User.findById(id);
      if (!instructeur) {
        throw createError(404, 'Instructeur non trouvé');
      }

      if (instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(400, 'L\'utilisateur spécifié n\'est pas un instructeur');
      }

      // Compter les étudiants uniques pour cet instructeur
      const totalStudents = await Cours.aggregate([
        // Étape 1: Filtrer les cours de cet instructeur qui ont des étudiants
        { 
          $match: { 
            instructeurId: new mongoose.Types.ObjectId(id),
            'etudiantsInscrits': { 
              $exists: true, 
              $ne: [], 
              $not: { $size: 0 } 
            } 
          } 
        },
        
        // Étape 2: Dérouler le tableau des étudiants
        { $unwind: '$etudiantsInscrits' },
        
        // Étape 3: Grouper par ID d'étudiant
        { 
          $group: {
            _id: '$etudiantsInscrits._id'
          }
        },
        
        // Étape 4: Compter
        { 
          $count: 'totalStudents' 
        }
      ]);

      const count = totalStudents.length > 0 ? totalStudents[0].totalStudents : 0;

      console.log(`✅ Étudiants pour l'instructeur ${id}: ${count}`);

      res.json({
        success: true,
        data: {
          totalStudents: count,
          instructorId: id,
          instructorName: `${instructeur.nom} ${instructeur.prenom}`,
          timestamp: new Date().toISOString()
        },
        message: `Nombre d'étudiants récupéré pour l'instructeur: ${count}`
      });

    } catch (err) {
      console.error('❌ Erreur dans getTotalStudentsByInstructor:', err);
      next(createError(500, 'Erreur lors du comptage des étudiants par instructeur'));
    }
  };

  // NOUVELLE MÉTHODE : Récupérer tous les instructeurs (ENSEIGNANTS)
  static getInstructeurs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Récupération de tous les instructeurs...');
      
      const instructeurs = await User.find({ 
        role: RoleUtilisateur.ENSEIGNANT 
      })
      .select('-password')
      .lean();

      console.log(`Nombre d'instructeurs trouvés: ${instructeurs.length}`);

      res.json({
        success: true,
        data: instructeurs,
        message: 'Instructeurs récupérés avec succès',
      });
    } catch (err) {
      console.error('Erreur dans getInstructeurs:', err);
      next(err);
    }
  };

  static getDomaines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Récupération des domaines...');
      
      const domaines = await Domaine.find({}).lean();
      
      console.log(`Nombre de domaines trouvés: ${domaines.length}`);

      res.json({
        success: true,
        data: domaines,
        message: 'Domaines récupérés avec succès',
      });
    } catch (err) {
      console.error('Erreur dans getDomaines:', err);
      next(err);
    }
  };

  static getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const instructeur = await User.findById(id)
        .populate<{ coursCrees: CourseDocument[] }>({
          path: 'coursCrees',
          select: 'titre description niveau domaineId statutApprobation estPublie duree createdAt contenu',
          populate: { path: 'domaineId', select: 'nom' },
        })
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur.coursCrees || [],
        message: 'Cours récupérés avec succès',
      });
    } catch (err) {
      console.error('Erreur dans getCourses:', err);
      next(err);
    }
  };

  // FONCTION HELPER POUR VALIDER ET NETTOYER LE CONTENU
  private static validateAndCleanContenu(contenu: any): any {
    if (!contenu || !contenu.sections || !Array.isArray(contenu.sections)) {
      return contenu;
    }

    // Parcourir toutes les sections et modules pour valider et nettoyer
    const cleanedSections = contenu.sections.map((section: any) => {
      if (!section.modules || !Array.isArray(section.modules)) {
        return section;
      }

      const cleanedModules = section.modules.map((module: any) => {
        // CORRECTION 1: Assurer que le type est en MAJUSCULES
        if (module.type) {
          module.type = module.type.toUpperCase();
          
          // Validation des types autorisés
          const validTypes = ['VIDEO', 'DOCUMENT', 'QUIZ', 'EXERCICE', 'TEXTE'];
          if (!validTypes.includes(module.type)) {
            throw createError(400, `Type de module invalide: ${module.type}. Types valides: ${validTypes.join(', ')}`);
          }
        }

        // CORRECTION 2: S'assurer que la durée est un nombre valide
        if (module.duree === null || module.duree === undefined) {
          throw createError(400, `La durée est requise pour le module: ${module.titre || 'Sans titre'}`);
        }

        // Convertir la durée en nombre et s'assurer qu'elle est positive
        module.duree = Number(module.duree);
        if (isNaN(module.duree) || module.duree <= 0) {
          // Définir une durée par défaut si invalide
          module.duree = 1; // 1 minute par défaut
          console.warn(`Durée invalide pour le module "${module.titre}", définition à 1 minute par défaut`);
        }

        // Nettoyer les autres champs
        if (module.titre) module.titre = module.titre.trim();
        if (module.description) module.description = module.description.trim();
        if (module.contenu) module.contenu = module.contenu.toString().trim();

        return module;
      });

      return {
        ...section,
        modules: cleanedModules,
        titre: section.titre ? section.titre.trim() : section.titre,
        description: section.description ? section.description.trim() : section.description
      };
    });

    return {
      ...contenu,
      sections: cleanedSections
    };
  }

  static createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const { titre, description, duree, domaineId, niveau, contenu, quizzes, estPublie, statutApprobation, instructeurId } = req.body;

      if (!titre || !duree || !domaineId || !niveau) {
        throw createError(400, 'Les champs titre, durée, domaineId et niveau sont requis');
      }

      if (!mongoose.Types.ObjectId.isValid(domaineId)) {
        throw createError(400, 'ID de domaine invalide');
      }

      const domaineExists = await Domaine.findById(domaineId);
      if (!domaineExists) {
        throw createError(400, 'Domaine non trouvé');
      }

      // Utiliser l'instructeur ID fourni ou celui de l'URL
      const finalInstructeurId = instructeurId || id;
      
      const instructeur = await User.findById(finalInstructeurId) as UserDocument;
      if (!instructeur || (instructeur.role !== RoleUtilisateur.ENSEIGNANT && instructeur.role !== RoleUtilisateur.ADMIN)) {
        throw createError(404, 'Instructeur non trouvé');
      }

      // CORRECTION: Validation et nettoyage du contenu AVANT création
      let parsedContenu: any = undefined;
      if (contenu !== undefined) {
        if (contenu === null) {
          parsedContenu = null;
        } else if (contenu.sections && Array.isArray(contenu.sections)) {
          // VALIDER ET NETTOYER LE CONTENU
          const cleanedContenu = this.validateAndCleanContenu(contenu);
          parsedContenu = { sections: cleanedContenu.sections };
        } else {
          throw createError(400, 'Format de contenu invalide : doit avoir une propriété "sections" (tableau)');
        }
      }

      // VALIDER LA DURÉE DU COURS
      const courseDuree = Number(duree);
      if (isNaN(courseDuree) || courseDuree <= 0) {
        throw createError(400, 'La durée du cours doit être un nombre supérieur à 0');
      }

      const courseData: any = {
        titre: titre.trim(),
        description: description?.trim() ?? '',
        duree: courseDuree,
        domaineId: new Types.ObjectId(domaineId),
        instructeurId: new Types.ObjectId(finalInstructeurId),
        createur: new Types.ObjectId(finalInstructeurId),
        niveau,
        statutApprobation: statutApprobation || 'PENDING',
        estPublie: estPublie === true,
        etudiants: [],
        quizzes: quizzes || [],
        progression: 0,
        contenu: parsedContenu,
      };

      console.log('Données du cours avant création:', JSON.stringify(courseData, null, 2));

      const cours = await Cours.create(courseData);

      if (!instructeur.coursCrees) instructeur.coursCrees = [];
      if (!instructeur.coursEnCoursEdition) instructeur.coursEnCoursEdition = [];

      instructeur.coursCrees.push(cours._id as mongoose.Types.ObjectId);
      await instructeur.save();

      const coursPopulated = await Cours.findById(cours._id)
        .populate('domaineId', 'nom')
        .populate('instructeurId', 'username nom prenom')
        .lean();

      res.status(201).json({
        success: true,
        data: coursPopulated,
        message: 'Cours créé avec succès',
      });
    } catch (err: any) {
      console.error('Erreur dans createCourse:', err);
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
        return next(createError(400, `Erreurs de validation: ${messages}`));
      }
      if (err.name === 'CastError') {
        return next(createError(400, `Données invalides: ${err.message}`));
      }
      next(err);
    }
  };

  static updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      if (!id || !courseId || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'ID invalide');
      }

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const coursExistant = await Cours.findById(courseId);
      if (!coursExistant) {
        throw createError(404, 'Cours non trouvé');
      }

      const { titre, description, duree, domaineId, niveau, contenu, quizzes, statutApprobation, estPublie, instructeurId } = req.body;
      const updates: any = {};

      if (titre !== undefined) updates.titre = titre.trim();
      if (description !== undefined) updates.description = description.trim();
      if (duree !== undefined) {
        const courseDuree = Number(duree);
        if (isNaN(courseDuree) || courseDuree <= 0) {
          throw createError(400, 'La durée du cours doit être un nombre supérieur à 0');
        }
        updates.duree = courseDuree;
      }
      if (niveau) updates.niveau = niveau;
      if (quizzes !== undefined) updates.quizzes = quizzes;
      if (statutApprobation) updates.statutApprobation = statutApprobation;
      if (estPublie !== undefined) updates.estPublie = estPublie;

      if (domaineId) {
        if (!mongoose.Types.ObjectId.isValid(domaineId)) {
          throw createError(400, 'ID de domaine invalide');
        }
        const domaineExists = await Domaine.findById(domaineId);
        if (!domaineExists) throw createError(400, 'Domaine non trouvé');
        updates.domaineId = new Types.ObjectId(domaineId);
      }

      if (instructeurId) {
        if (!mongoose.Types.ObjectId.isValid(instructeurId)) {
          throw createError(400, 'ID instructeur invalide');
        }
        const instructeurExists = await User.findById(instructeurId);
        if (!instructeurExists) throw createError(400, 'Instructeur non trouvé');
        updates.instructeurId = new Types.ObjectId(instructeurId);
      }

      // CORRECTION: Validation et nettoyage du contenu pour update aussi
      if (contenu !== undefined) {
        if (contenu === null) {
          updates.contenu = null;
        } else if (contenu.sections && Array.isArray(contenu.sections)) {
          const cleanedContenu = this.validateAndCleanContenu(contenu);
          updates.contenu = { sections: cleanedContenu.sections };
        } else {
          throw createError(400, 'Format de contenu invalide : doit avoir une propriété "sections" (tableau)');
        }
      }

      const cours = await Cours.findByIdAndUpdate(
        courseId,
        { $set: updates },
        { new: true, runValidators: true }
      )
      .populate('domaineId', 'nom')
      .populate('instructeurId', 'username nom prenom');

      if (!cours) throw createError(404, 'Cours non trouvé');

      res.json({
        success: true,
        data: cours,
        message: 'Cours mis à jour avec succès',
      });
    } catch (err: any) {
      console.error('Erreur dans updateCourse:', err);
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
        return next(createError(400, `Erreurs de validation: ${messages}`));
      }
      if (err.name === 'CastError') {
        return next(createError(400, `Données invalides: ${err.message}`));
      }
      next(err);
    }
  };

  static submitForApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId } = req.params;
      if (!id || !courseId || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(courseId)) {
        throw createError(400, 'ID invalide');
      }

      if (!req.user || (req.user.id !== id && req.user.role !== RoleUtilisateur.ADMIN)) {
        throw createError(403, 'Accès non autorisé');
      }

      const instructeur = await User.findById(id);
      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      const cours = await Cours.findById(courseId);
      if (!cours) throw createError(404, 'Cours non trouvé');

      if (!instructeur.coursEnCoursEdition) instructeur.coursEnCoursEdition = [];
      if (!instructeur.coursCrees) instructeur.coursCrees = [];

      const index = instructeur.coursEnCoursEdition.findIndex(c => c.toString() === courseId);
      if (index !== -1) {
        instructeur.coursEnCoursEdition.splice(index, 1);
        if (!instructeur.coursCrees.some(c => c.toString() === courseId)) {
          instructeur.coursCrees.push(new Types.ObjectId(courseId));
        }
        await instructeur.save();
      }

      cours.statutApprobation = 'PENDING';
      await cours.save();

      const coursPopulated = await Cours.findById(courseId)
        .populate('domaineId', 'nom')
        .populate('instructeurId', 'username nom prenom')
        .lean();

      res.json({
        success: true,
        data: coursPopulated,
        message: 'Cours soumis pour approbation avec succès',
      });
    } catch (err) {
      console.error('Erreur dans submitForApproval:', err);
      next(err);
    }
  };

  static getCoursesInProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const instructeur = await User.findById(id)
        .populate<{ coursEnCoursEdition: CourseDocument[] }>({
          path: 'coursEnCoursEdition',
          select: 'titre niveau domaineId description duree createdAt contenu',
          populate: { path: 'domaineId', select: 'nom' },
        })
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur.coursEnCoursEdition || [],
        message: 'Cours en cours récupérés avec succès',
      });
    } catch (err) {
      console.error('Erreur dans getCoursesInProgress:', err);
      next(err);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError(400, 'ID instructeur invalide');
      }

      const instructeur = await User.findById(id)
        .populate([
          { path: 'coursCrees', select: 'titre niveau domaineId statutApprobation estPublie duree contenu', populate: { path: 'domaineId', select: 'nom' } },
          { path: 'coursEnCoursEdition', select: 'titre niveau domaineId description duree contenu', populate: { path: 'domaineId', select: 'nom' } },
        ])
        .select('-password')
        .lean<UserDocument>();

      if (!instructeur || instructeur.role !== RoleUtilisateur.ENSEIGNANT) {
        throw createError(404, 'Instructeur non trouvé');
      }

      res.json({
        success: true,
        data: instructeur,
        message: 'Profil récupéré avec succès',
      });
    } catch (err) {
      console.error('Erreur dans getProfile:', err);
      next(err);
    }
  };
}

// Export des fonctions COMPLET avec les nouvelles méthodes
export const getInstructeurs = InstructeurController.getInstructeurs;
export const getDomaines = InstructeurController.getDomaines;
export const getCourses = InstructeurController.getCourses;
export const createCourse = InstructeurController.createCourse;
export const updateCourse = InstructeurController.updateCourse;
export const submitForApproval = InstructeurController.submitForApproval;
export const getCoursesInProgress = InstructeurController.getCoursesInProgress;
export const getProfile = InstructeurController.getProfile;
export const getTotalStudents = InstructeurController.getTotalStudents;
export const getTotalStudentsByInstructor = InstructeurController.getTotalStudentsByInstructor;