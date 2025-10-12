import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { StatutInscription } from '../models/enums/StatutInscription';

// Validation schema for enrolling in a course
export const enroll = [
  Joi.object({
    coursId: Joi.string().required().messages({
      'string.base': 'L\'ID du cours doit être une chaîne',
      'any.required': 'L\'ID du cours est requis',
    }),
  }).validateAsync.bind(Joi.object({
    coursId: Joi.string().required(),
  })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await enroll[0](req.body);
      next();
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: (err as Error).message }] });
    }
  },
];

// Validation schema for updating progress
export const updateProgress = [
  Joi.object({
    pourcentage: Joi.number().min(0).max(100).required().messages({
      'number.base': 'Le pourcentage doit être un nombre',
      'number.min': 'Le pourcentage doit être au moins 0',
      'number.max': 'Le pourcentage ne peut pas dépasser 100',
      'any.required': 'Le pourcentage est requis',
    }),
  }).validateAsync.bind(Joi.object({
    pourcentage: Joi.number().min(0).max(100).required(),
  })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateProgress[0](req.body);
      next();
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: (err as Error).message }] });
    }
  },
];

// Validation schema for updating inscription status
export const updateStatus = [
  Joi.object({
    statut: Joi.string()
      .valid(...Object.values(StatutInscription))
      .required()
      .messages({
        'string.base': 'Le statut doit être une chaîne',
        'any.only': 'Statut d\'inscription invalide',
        'any.required': 'Le statut est requis',
      }),
  }).validateAsync.bind(Joi.object({
    statut: Joi.string().valid(...Object.values(StatutInscription)).required(),
  })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateStatus[0](req.body);
      next();
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: (err as Error).message }] });
    }
  },
];