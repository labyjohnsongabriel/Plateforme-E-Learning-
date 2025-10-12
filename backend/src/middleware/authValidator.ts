import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Middleware pour formater les erreurs Joi
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => ({
        type: 'field',
        msg: err.message,
        path: err.path[0],
        location: 'body',
      }));
      return res.status(400).json({ errors });
    }
    next();
  };
};

export const register = Joi.object({
  nom: Joi.string().required().messages({
    'string.empty': 'Le nom est requis',
    'any.required': 'Le nom est requis',
  }),
  prenom: Joi.string().required().messages({
    'string.empty': 'Le prénom est requis',
    'any.required': 'Le prénom est requis',
  }),
  email: Joi.string().email().required().messages({
    'string.email': "Format d'email invalide",
    'string.empty': "L'email est requis",
    'any.required': "L'email est requis",
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'string.empty': 'Le mot de passe est requis',
    'any.required': 'Le mot de passe est requis',
  }),
  role: Joi.string().optional(),
});

export const login = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': "Format d'email invalide",
    'string.empty': "L'email est requis",
    'any.required': "L'email est requis",
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis',
    'any.required': 'Le mot de passe est requis',
  }),
});

export const update = Joi.object({
  nom: Joi.string().optional().messages({
    'string.empty': 'Le nom ne peut pas être vide',
  }),
  prenom: Joi.string().optional().messages({
    'string.empty': 'Le prénom ne peut pas être vide',
  }),
});

export const changePassword = Joi.object({
  ancienMotDePasse: Joi.string().required().messages({
    'string.empty': "L'ancien mot de passe est requis",
    'any.required': "L'ancien mot de passe est requis",
  }),
  nouveauMotDePasse: Joi.string().min(6).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
    'string.empty': 'Le nouveau mot de passe est requis',
    'any.required': 'Le nouveau mot de passe est requis',
  }),
});

export const resetPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': "Format d'email invalide",
    'string.empty': "L'email est requis",
    'any.required': "L'email est requis",
  }),
});

export const setNewPassword = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Le token est requis',
    'any.required': 'Le token est requis',
  }),
  nouveauMotDePasse: Joi.string().min(6).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
    'string.empty': 'Le nouveau mot de passe est requis',
    'any.required': 'Le nouveau mot de passe est requis',
  }),
});

export const deleteSchema = Joi.object({
  motDePasse: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis',
    'any.required': 'Le mot de passe est requis',
  }),
});

export const getById = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': "L'ID doit être un identifiant hexadécimal valide",
    'string.length': "L'ID doit avoir 24 caractères",
    'any.required': "L'ID est requis",
  }),
});

export const getAll = Joi.object({
  page: Joi.number().min(1).optional().messages({
    'number.min': 'La page doit être au moins 1',
  }),
  limit: Joi.number().min(1).max(100).optional().messages({
    'number.min': 'La limite doit être au moins 1',
    'number.max': 'La limite ne peut pas dépasser 100',
  }),
});

export const search = Joi.object({
  query: Joi.string().required().messages({
    'string.empty': 'La requête de recherche est requise',
    'any.required': 'La requête de recherche est requise',
  }),
  page: Joi.number().min(1).optional().messages({
    'number.min': 'La page doit être au moins 1',
  }),
  limit: Joi.number().min(1).max(100).optional().messages({
    'number.min': 'La limite doit être au moins 1',
    'number.max': 'La limite ne peut pas dépasser 100',
  }),
});

export const filter = Joi.object({
  role: Joi.string().optional(),
  dateInscription: Joi.date().optional(),
  dernierConnexion: Joi.date().optional(),
  page: Joi.number().min(1).optional().messages({
    'number.min': 'La page doit être au moins 1',
  }),
  limit: Joi.number().min(1).max(100).optional().messages({
    'number.min': 'La limite doit être au moins 1',
    'number.max': 'La limite ne peut pas dépasser 100',
  }),
});

export const sort = Joi.object({
  sortBy: Joi.string()
    .valid('nom', 'prenom', 'email', 'dateInscription', 'dernierConnexion')
    .optional()
    .messages({
      'any.only': "Le champ de tri doit être l'un de : nom, prenom, email, dateInscription, dernierConnexion",
    }),
  order: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': "L'ordre doit être 'asc' ou 'desc'",
  }),
  page: Joi.number().min(1).optional().messages({
    'number.min': 'La page doit être au moins 1',
  }),
  limit: Joi.number().min(1).max(100).optional().messages({
    'number.min': 'La limite doit être au moins 1',
    'number.max': 'La limite ne peut pas dépasser 100',
  }),
});

export const getProfile = Joi.object({});

export const updateProfile = Joi.object({
  nom: Joi.string().optional().messages({
    'string.empty': 'Le nom ne peut pas être vide',
  }),
  prenom: Joi.string().optional().messages({
    'string.empty': 'Le prénom ne peut pas être vide',
  }),
});

export const changeProfilePicture = Joi.object({});

export const deleteProfile = Joi.object({
  motDePasse: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis',
    'any.required': 'Le mot de passe est requis',
  }),
});

export const getUserStatistics = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

export const getActiveUsers = Joi.object({
  days: Joi.number().min(1).required().messages({
    'number.min': 'Le nombre de jours doit être au moins 1',
    'any.required': 'Le nombre de jours est requis',
  }),
});

export const getInactiveUsers = Joi.object({
  days: Joi.number().min(1).required().messages({
    'number.min': 'Le nombre de jours doit être au moins 1',
    'any.required': 'Le nombre de jours est requis',
  }),
});

export const getNewUsers = Joi.object({
  days: Joi.number().min(1).required().messages({
    'number.min': 'Le nombre de jours doit être au moins 1',
    'any.required': 'Le nombre de jours est requis',
  }),
});