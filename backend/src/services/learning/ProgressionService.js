const Progression = require("../../models/learning/Progression");
const Cours = require("../../models/course/Cours"); 
const StatutProgression = require("../../models/enums/StatutProgression");

exports.initialize = async (apprenantId, coursId) => {
  try {
    const existing = await Progression.findOne({
      apprenant: apprenantId,
      cours: coursId,
    });
    if (existing) {
      return existing; // Retourne si déjà initialisé
    }

    const cours = await Cours.findById(coursId);
    if (!cours) {
      throw new Error("Cours non trouvé");
    }

    const progression = new Progression({
      apprenant: apprenantId,
      cours: coursId,
      dateDebut: new Date(),
    });
    await progression.save();
    return progression;
  } catch (err) {
    console.error("Erreur lors de l'initialisation de la progression:", err);
    throw err;
  }
};

exports.update = async (apprenantId, coursId, pourcentage) => {
  try {
    if (pourcentage < 0 || pourcentage > 100) {
      throw new Error("Pourcentage invalide (doit être entre 0 et 100)");
    }

    let progression = await Progression.findOne({
      apprenant: apprenantId,
      cours: coursId,
    });
    if (!progression) {
      throw new Error("Progression non trouvée");
    }

    progression.pourcentage = pourcentage;
    if (pourcentage === 100) {
      progression.dateFin = new Date();
      progression.statut = StatutProgression.COMPLETE;
    } else if (
      pourcentage > 0 &&
      progression.statut === StatutProgression.EN_COURS
    ) {
      // Logique optionnelle pour statut intermédiaire
    }

    await progression.save();
    return progression;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la progression:", err);
    throw err;
  }
};

exports.getByUserAndCourse = async (apprenantId, coursId) => {
  try {
    const progression = await Progression.findOne({
      apprenant: apprenantId,
      cours: coursId,
    }).populate("cours", "titre niveau");
    if (!progression) {
      throw new Error("Progression non trouvée");
    }
    return progression;
  } catch (err) {
    throw err;
  }
};

exports.getUserProgressions = async (apprenantId) => {
  try {
    const progressions = await Progression.find({
      apprenant: apprenantId,
    }).populate("cours", "titre niveau domaine");
    return progressions;
  } catch (err) {
    throw err;
  }
};

// Pour admin : getAll ou stats (extensible pour tableau de bord)
exports.getAllProgressions = async () => {
  try {
    const progressions = await Progression.find()
      .populate("apprenant", "nom prenom")
      .populate("cours", "titre");
    return progressions;
  } catch (err) {
    throw err;
  }
};
