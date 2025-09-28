// backend/controllers/course/DomaineController.js
const createError = require("http-errors");
const Domaine = require("../../models/course/Domaine");
const logger = require("../../utils/logger");

class DomaineService {
  static async create(data) {
    try {
      const domaine = new Domaine(data);
      await domaine.save();
      return domaine;
    } catch (err) {
      logger.error(`Error creating domaine: ${err.message}`);
      throw err;
    }
  }

  static async getAll() {
    try {
      const domaines = await Domaine.find().lean();
      return domaines;
    } catch (err) {
      logger.error(`Error fetching domaines: ${err.message}`);
      throw err;
    }
  }

  static async getById(id) {
    try {
      const domaine = await Domaine.findById(id).lean();
      if (!domaine) throw createError(404, "Domaine non trouvé");
      return domaine;
    } catch (err) {
      logger.error(`Error fetching domaine by ID: ${err.message}`);
      throw err;
    }
  }

  static async update(id, data) {
    try {
      const domaine = await Domaine.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!domaine) throw createError(404, "Domaine non trouvé");
      return domaine;
    } catch (err) {
      logger.error(`Error updating domaine: ${err.message}`);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const domaine = await Domaine.findByIdAndDelete(id);
      if (!domaine) throw createError(404, "Domaine non trouvé");
      // Optionally delete associated courses
      const Cours = require("../../models/course/Cours");
      await Cours.deleteMany({ domaineId: id });
      return domaine;
    } catch (err) {
      logger.error(`Error deleting domaine: ${err.message}`);
      throw err;
    }
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
      res.json({ data: domaines }); // Match frontend expectation
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
      res.json({ message: "Domaine supprimé", domaine });
    } catch (err) {
      next(err);
    }
  },
};
