// controllers/course/CoursController.js
const createError = require("http-errors");
const Cours = require("../../models/course/Cours");

class CoursService {
  static async create(data, createurId) {
    const cours = new Cours({ ...data, createur: createurId });
    await cours.save();
    // Ajouter au domaine (innovation: liaison automatique)
    const Domaine = mongoose.model("Domaine");
    await Domaine.findByIdAndUpdate(data.domaine, {
      $push: { cours: cours._id },
    });
    return cours;
  }

  static async getAll() {
    return Cours.find().populate("domaine niveau contenus quizzes");
  }

  static async getById(id) {
    const cours = await Cours.findById(id).populate(
      "domaine niveau contenus quizzes"
    );
    if (!cours) throw createError(404, "Cours non trouvé");
    return cours;
  }

  static async update(id, data) {
    const cours = await Cours.findByIdAndUpdate(id, data, { new: true });
    if (!cours) throw createError(404, "Cours non trouvé");
    return cours;
  }

  static async delete(id) {
    const cours = await Cours.findByIdAndDelete(id);
    if (!cours) throw createError(404, "Cours non trouvé");
    // Innovation: Supprimer les contenus et quizzes associés
    const Contenu = mongoose.model("Contenu");
    const Quiz = mongoose.model("Quiz");
    await Contenu.deleteMany({ cours: id });
    await Quiz.deleteMany({ cours: id });
    return cours;
  }
}

module.exports = {
  create: async (req, res, next) => {
    try {
      const cours = await CoursService.create(req.body, req.user.id);
      res.status(201).json(cours);
    } catch (err) {
      next(err);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const cours = await CoursService.getAll();
      res.json(cours);
    } catch (err) {
      next(err);
    }
  },
  getById: async (req, res, next) => {
    try {
      const cours = await CoursService.getById(req.params.id);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const cours = await CoursService.update(req.params.id, req.body);
      res.json(cours);
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const cours = await CoursService.delete(req.params.id);
      res.json({ message: "Cours supprimé", cours });
    } catch (err) {
      next(err);
    }
  },
};
