import { Types } from 'mongoose';
import createError from 'http-errors';
import {User , IUser } from '../../models/user/User';
import Progression from '../../models/learning/Progression';
import Certificat from '../../models/learning/Certificat';

// Get all users
export const getAllUsers = async (): Promise<Partial<IUser>[]> => {
  try {
    return await User.find().select('-motDePasse');
  } catch (err) {
    throw createError(500, `Erreur lors de la récupération des utilisateurs: ${(err as Error).message}`);
  }
};

// Update a user
export const updateUser = async (userId: string | Types.ObjectId, data: Partial<IUser>): Promise<IUser | null> => {
  try {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    if (!user) {
      throw createError(404, 'Utilisateur non trouvé');
    }
    return user;
  } catch (err) {
    throw createError(500, `Erreur lors de la mise à jour de l'utilisateur: ${(err as Error).message}`);
  }
};

// Delete a user
export const deleteUser = async (userId: string | Types.ObjectId): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw createError(404, 'Utilisateur non trouvé');
    }
    // Optionally delete associated progressions and certificates
    await Progression.deleteMany({ apprenant: userId });
    await Certificat.deleteMany({ apprenant: userId });
  } catch (err) {
    throw createError(500, `Erreur lors de la suppression de l'utilisateur: ${(err as Error).message}`);
  }
};