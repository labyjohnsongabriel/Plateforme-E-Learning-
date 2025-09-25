const User = require("../../models/user/User");
const InscriptionService = require("../../services/learning/InscriptionService");
const ProgressionService = require("../../services/learning/ProgressionService");
const CertificatService = require("../../services/learning/CertificationService");

exports.getProgress = async (req, res, next) => {
  try {
    const apprenant = await User.findById(req.params.id)
      .populate("progres", "pourcentage dateDebut dateFin")
      .lean(); // Lean pour performance si pas de modification
    if (!apprenant || apprenant.role !== "APPRENANT") {
      return res.status(404).json({ message: "Apprenant non trouvé" });
    }
    res.json(apprenant.progres);
  } catch (err) {
    console.error("Erreur lors de la récupération des progrès:", err);
    next(err);
  }
};

exports.getCertificates = async (req, res, next) => {
  try {
    const apprenant = await User.findById(req.params.id)
      .populate("certificats", "dateEmission urlCertificat")
      .lean();
    if (!apprenant || apprenant.role !== "APPRENANT") {
      return res.status(404).json({ message: "Apprenant non trouvé" });
    }
    res.json(apprenant.certificats);
  } catch (err) {
    next(err);
  }
};

exports.enrollInCourse = async (req, res, next) => {
  try {
    const { coursId } = req.body;
    const inscription = await InscriptionService.enroll(req.params.id, coursId);
    // Initialiser progression
    await ProgressionService.initialize(req.params.id, coursId);
    res.status(201).json(inscription);
  } catch (err) {
    next(err);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { coursId, pourcentage } = req.body;
    const progression = await ProgressionService.update(
      req.params.id,
      coursId,
      pourcentage
    );
    if (pourcentage === 100) {
      const cert = await CertificatService.generateIfEligible(progression);
      if (cert) {
        // Ajouter certificat à l'apprenant (mise à jour manuelle ici, sinon via hook)
        const apprenant = await User.findById(req.params.id);
        apprenant.certificats.push(cert._id);
        await apprenant.save();
      }
    }
    res.json(progression);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const apprenant = await User.findById(req.params.id)
      .populate("progres certificats")
      .select("-motDePasse") // Exclure mot de passe
      .lean();
    if (!apprenant || apprenant.role !== "APPRENANT") {
      return res.status(404).json({ message: "Apprenant non trouvé" });
    }
    res.json(apprenant);
  } catch (err) {
    next(err);
  }
};