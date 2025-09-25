// controllers/course/DomaineController.js
const createError = require("http-errors");
const Domaine = require("../../models/course/Domaine");

class DomaineService {
  static async create(data) {
    const domaine = new Domaine(data);
    await domaine.save();
    return domaine;
  }

  static async getAll() {
    return Domaine.find().populate("cours");
  }

  static async getById(id) {
    const domaine = await Domaine.findById(id).populate("cours");
    if (!domaine) throw createError(404, "Domaine non trouvé");
    return domaine;
  }

  static async update(id, data) {
    const domaine = await Domaine.findByIdAndUpdate(id, data, { new: true });
    if (!domaine) throw createError(404, "Domaine non trouvé");
    return domaine;
  }

  static async delete(id) {
    const domaine = await Domaine.findByIdAndDelete(id);
    if (!domaine) throw createError(404, "Domaine non trouvé");
    return domaine;
  }
}

module.exports = {
  create: async (req, res, next) => {
    try {
      const domaine = await DomaineService.create(req.body);
      res.status(201).json(domaine);
    } catch (err) {
      next(err);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const domaines = await DomaineService.getAll();
      res.json(domaines);
    } catch (err) {
      next(err);
    }
  },
  getById: async (req, res, next) => {
    try {
      const domaine = await DomaineService.getById(req.params.id);
      res.json(domaine);
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const domaine = await DomaineService.update(req.params.id, req.body);
      res.json(domaine);
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const domaine = await DomaineService.delete(req.params.id);
      res.json({ message: "Domaine supprimé" });
    } catch (err) {
      next(err);
    }
  },
};
