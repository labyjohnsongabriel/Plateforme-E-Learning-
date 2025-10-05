import { Types } from 'mongoose';
import Inscription, { IInscription } from '../../models/learning/Inscription';
import Cours, { ICours } from '../../models/course/Cours';
import Progression, { IProgression } from '../../models/learning/Progression';

// Placeholder enum for StatutInscription (based on usage)
export enum StatutInscription {
  EN_COURS = 'EN_COURS',
  COMPLETE = 'COMPLETE',
  // Add other statuses as needed
}

// Enroll a user in a course
export const enroll = async (apprenantId: string | Types.ObjectId, coursId: string | Types.ObjectId): Promise<IInscription> => {
  try {
    const cours = await Cours.findById(coursId);
    if (!cours) {
      throw new Error('Cours non trouvé');
    }

    const existing = await Inscription.findOne({ apprenant: apprenantId, cours: coursId });
    if (existing) {
      throw new Error('Déjà inscrit à ce cours');
    }

    const inscription = new Inscription({
      apprenant: apprenantId,
      cours: coursId,
    });
    await inscription.save();

    const progression = new Progression({
      apprenant: apprenantId,
      cours: coursId,
      pourcentage: 0,
      statut: StatutInscription.EN_COURS,
    });
    await progression.save();

    return inscription;
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    throw err;
  }
};

// Get all enrollments for a user
export const getUserEnrollments = async (apprenantId: string | Types.ObjectId): Promise<IInscription[]> => {
  try {
    const enrollments = await Inscription.find({ apprenant: apprenantId }).populate('cours', 'titre niveau domaine');
    return enrollments;
  } catch (err) {
    throw err;
  }
};

// Update enrollment status
export const updateStatus = async (
  inscriptionId: string | Types.ObjectId,
  newStatus: StatutInscription,
  apprenantId: string | Types.ObjectId
): Promise<IInscription> => {
  try {
    const inscription = await Inscription.findOne({ _id: inscriptionId, apprenant: apprenantId });
    if (!inscription) {
      throw new Error('Inscription non trouvée ou non autorisée');
    }

    if (!Object.values(StatutInscription).includes(newStatus)) {
      throw new Error('Statut invalide');
    }

    inscription.statut = newStatus;
    await inscription.save();

    if (newStatus === StatutInscription.COMPLETE) {
      const progression = await Progression.findOne({ apprenant: apprenantId, cours: inscription.cours });
      if (progression) {
        progression.pourcentage = 100;
        await progression.save();
        // TODO: Uncomment and implement certificate generation if needed
        // import * as CertificatController from '../controllers/learning/CertificatController';
        // await CertificatController.generateCertificate(apprenantId, inscription.cours);
      }
    }

    return inscription;
  } catch (err) {
    throw err;
  }
};

// Delete an enrollment
export const deleteEnrollment = async (
  inscriptionId: string | Types.ObjectId,
  apprenantId: string | Types.ObjectId
): Promise<{ message: string }> => {
  try {
    const inscription = await Inscription.findOne({ _id: inscriptionId, apprenant: apprenantId });
    if (!inscription) {
      throw new Error('Inscription non trouvée ou non autorisée');
    }

    await Progression.deleteOne({ apprenant: apprenantId, cours: inscription.cours });
    await inscription.deleteOne();
    return { message: 'Inscription supprimée avec succès' };
  } catch (err) {
    throw err;
  }
};