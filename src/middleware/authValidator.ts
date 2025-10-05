// src/validations/authValidation.ts
import Joi from 'joi';

export const register = Joi.object({
  nom: Joi.string().required(),
  prenom: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().required(),
});

export const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const update = Joi.object({
  nom: Joi.string(),
  prenom: Joi.string(),
});

export const changePassword = Joi.object({
  ancienMotDePasse: Joi.string().required(),
  nouveauMotDePasse: Joi.string().min(6).required(),
});

export const resetPassword = Joi.object({
  email: Joi.string().email().required(),
});

export const setNewPassword = Joi.object({
  token: Joi.string().required(),
  nouveauMotDePasse: Joi.string().min(6).required(),
});

export const deleteSchema = Joi.object({
  motDePasse: Joi.string().required(),
});

export const getById = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const getAll = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});

export const search = Joi.object({
  query: Joi.string().required(),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});

export const filter = Joi.object({
  role: Joi.string(),
  dateInscription: Joi.date(),
  dernierConnexion: Joi.date(),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});

export const sort = Joi.object({
  sortBy: Joi.string().valid('nom', 'prenom', 'email', 'dateInscription', 'dernierConnexion'),
  order: Joi.string().valid('asc', 'desc'),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});

export const getProfile = Joi.object({});

export const updateProfile = Joi.object({
  nom: Joi.string(),
  prenom: Joi.string(),
});

export const changeProfilePicture = Joi.object({});

export const deleteProfile = Joi.object({
  motDePasse: Joi.string().required(),
});

export const getUserStatistics = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date(),
});

export const getActiveUsers = Joi.object({
  days: Joi.number().min(1).required(),
});

export const getInactiveUsers = Joi.object({
  days: Joi.number().min(1).required(),
});

export const getNewUsers = Joi.object({
  days: Joi.number().min(1).required(),
});