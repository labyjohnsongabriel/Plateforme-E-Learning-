import { Types } from 'mongoose';
import createError from 'http-errors';
import User, { IUser } from '../../models/user/User';
import * as InscriptionService from '../../services/learning/InscriptionService';
import * as ProgressionService from '../../services/learning/ProgressionService';
import { ICertificat } from '../../models/learning/Certificat';
import { IProgression } from '../../models/learning/Progression';

// Get apprenant's progress
export const getApprenantProgress = async (apprenantId: string | Types.ObjectId): Promise<IProgression[]> => {
  const apprenant = await User.findById(apprenantId).populate('progres');
  if (!apprenant) {
    throw createError(404, 'Apprenant non trouvé');
  }
  return apprenant.progres || [];
};

// Get apprenant's certificates
export const getApprenantCertificates = async (apprenantId: string | Types.ObjectId): Promise<ICertificat[]> => {
  const apprenant = await User.findById(apprenantId).populate('certificats');
  if (!apprenant) {
    throw createError(404, 'Apprenant non trouvé');
  }
  return apprenant.certificats || [];
};

// Enroll apprenant in a course
export const enrollApprenant = async (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId) => {
  return await InscriptionService.enroll(apprenantId, coursId);
};

// Update apprenant's progress
export const updateApprenantProgress = async (
  apprenantId: string | Types.ObjectId,
  coursId: string | Types.ObjectId,
  pourcentage: number
) => {
  return await ProgressionService.update(apprenantId, coursId, pourcentage);
};