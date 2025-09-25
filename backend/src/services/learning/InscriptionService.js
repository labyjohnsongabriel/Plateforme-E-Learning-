const Inscription = require("../../models/learning/Inscription");
const Cours = require("../../models/course/Cours"); // Assumez modèle Cours existe
const Progression = require("../../models/learning/Progression"); // Pour init progression
const StatutInscription = require("../../models/enums/StatutInscription");

exports.enroll = async (apprenantId, coursId) => {
  try {
    // Vérifier si le cours existe
    const cours = await Cours.findById(coursId);
    if (!cours) {
      throw new Error("Cours non trouvé");
    }

    // Vérifier si déjà inscrit
    const existing = await Inscription.findOne({ apprenant: apprenantId, cours: coursId });
    if (existing) {
      throw new Error("Déjà inscrit à ce cours");
    }

    // Créer inscription
    const inscription = new Inscription({
      apprenant: apprenantId,
      cours: coursId,
    });
    await inscription.save();

    // Initialiser progression (0%) pour ce cours, aligné avec système de progression
    const progression = new Progression({
      apprenant: apprenantId,
      cours: coursId,
      pourcentage: 0,
      statut: StatutInscription.EN_COURS,
    });
    await progression.save();

    return inscription;
  } catch (err) {
    console.error("Erreur lors de l'inscription:", err);
    throw err;
  }
};

exports.getUserEnrollments = async (apprenantId) => {
  try {
    const enrollments = await Inscription.find({ apprenant: apprenantId }).populate("cours", "titre niveau domaine");
    return enrollments;
  } catch (err) {
    throw err;
  }
};

exports.updateStatus = async (inscriptionId, newStatus, apprenantId) => {
  try {
    const inscription = await Inscription.findOne({ _id: inscriptionId, apprenant: apprenantId });
    if (!inscription) {
      throw new Error("Inscription non trouvée ou non autorisée");
    }

    if (!Object.values(StatutInscription).includes(newStatus)) {
      throw new Error("Statut invalide");
    }

    inscription.statut = newStatus;
    await inscription.save();

    // Si complété, synchroniser avec progression (e.g., trigger certificat si applicable)
    if (newStatus === StatutInscription.COMPLETE) {
      const progression = await Progression.findOne({ apprenant: apprenantId, cours: inscription.cours });
      if (progression) {
        progression.pourcentage = 100;
        await progression.save();
        // Appel à génération certificat (du précédent controller)
        // const CertificatController = require("../controllers/learning/CertificatController");
        // await CertificatController.generateCertificate(apprenantId, inscription.cours);
      }
    }

    return inscription;
  } catch (err) {
    throw err;
  }
};

exports.deleteEnrollment = async (inscriptionId, apprenantId) => {
  try {
    const inscription = await Inscription.findOne({ _id: inscriptionId, apprenant: apprenantId });
    if (!inscription) {
      throw new Error("Inscription non trouvée ou non autorisée");
    }

    // Supprimer aussi la progression associée
    await Progression.deleteOne({ apprenant: apprenantId, cours: inscription.cours });

    await inscription.deleteOne();
    return { message: "Inscription supprimée avec succès" };
  } catch (err) {
    throw err;
  }
};