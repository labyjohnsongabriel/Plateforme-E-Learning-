const User = require("../../models/user/User");
const InscriptionService = require("../../services/learning/InscriptionService"); // Pour suivi instructeur si besoin

exports.getCourses = async (req, res, next) => {
  try {
    const instructeur = await User.findById(req.params.id)
      .populate("coursCrees", "titre niveau domaine statutApprobation")
      .lean();
    if (!instructeur || instructeur.role !== "INSTRUCTEUR") {
      return res.status(404).json({ message: "Instructeur non trouvé" });
    }
    res.json(instructeur.coursCrees);
  } catch (err) {
    console.error("Erreur lors de la récupération des cours:", err);
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { titre, description, niveau, domaine, contenu } = req.body;
    const instructeurId = req.params.id;
    const cours = await CoursService.createCourse({
      titre,
      description,
      niveau,
      domaine,
      contenu,
      createur: instructeurId,
      statutApprobation: "PENDING", // Soumis pour approbation
    }, instructeurId);
    const instructeur = await User.findById(instructeurId);
    instructeur.coursEnCoursEdition.push(cours._id);
    await instructeur.save();
    res.status(201).json(cours);
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { coursId, titre, description, niveau, domaine, contenu } = req.body;
    const instructeurId = req.params.id;
    const cours = await CoursService.updateCourse(coursId, {
      titre,
      description,
      niveau,
      domaine,
      contenu,
    }, instructeurId);
    res.json(cours);
  } catch (err) {
    next(err);
  }
};

exports.submitForApproval = async (req, res, next) => {
  try {
    const { coursId } = req.body;
    const instructeurId = req.params.id;
    const instructeur = await User.findById(instructeurId);
    const courseIndex = instructeur.coursEnCoursEdition.indexOf(coursId);
    if (courseIndex > -1) {
      instructeur.coursEnCoursEdition.splice(courseIndex, 1);
      instructeur.coursCrees.push(coursId);
      await instructeur.save();
      const cours = await CoursService.updateCourse(coursId, { statutApprobation: "PENDING" }, instructeurId);
      res.json(cours);
    } else {
      return res.status(400).json({ message: "Cours non en cours d'édition" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getCoursesInProgress = async (req, res, next) => {
  try {
    const instructeur = await User.findById(req.params.id)
      .populate("coursEnCoursEdition", "titre niveau domaine")
      .lean();
    if (!instructeur || instructeur.role !== "INSTRUCTEUR") {
      return res.status(404).json({ message: "Instructeur non trouvé" });
    }
    res.json(instructeur.coursEnCoursEdition);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const instructeur = await User.findById(req.params.id)
      .populate("coursCrees coursEnCoursEdition")
      .select("-motDePasse")
      .lean();
    if (!instructeur || instructeur.role !== "INSTRUCTEUR") {
      return res.status(404).json({ message: "Instructeur non trouvé" });
    }
    res.json(instructeur);
  } catch (err) {
    next(err);
  }
};