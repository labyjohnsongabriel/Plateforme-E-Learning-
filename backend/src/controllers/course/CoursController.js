// backend/controllers/course/CoursController.js
const createError = require("http-errors");
const Cours = require("../../models/course/Cours");
const Domaine = require("../../models/course/Domaine");
const Contenu = require("../../models/course/Contenu");
const Quiz = require("../../models/course/Quiz");
const logger = require("../../utils/logger");

class CoursService {
  static async create(data, createurId) {
    try {
      const cours = new Cours({
        ...data,
        createur: createurId,
        domaineId: data.domaineId,
      });
      await cours.save();
      // Add course to domaine
      await Domaine.findByIdAndUpdate(data.domaineId, {
        $push: { cours: cours._id },
      });
      return cours;
    } catch (err) {
      logger.error(`Error creating course: ${err.message}`);
      throw err;
    }
  }

  static async getAll(page = 1, limit = 10) {
    try {
      const courses = await Cours.find()
        .populate("domaineId") // Only populate domaineId
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
      const total = await Cours.countDocuments();
      return {
        data: courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page * 1,
      };
    } catch (err) {
      logger.error(`Error fetching courses: ${err.message}`);
      throw err;
    }
  }

  static async getById(id) {
    try {
      const cours = await Cours.findById(id).populate("domaineId").lean();
      if (!cours) throw createError(404, "Cours non trouvé");
      return cours;
    } catch (err) {
      logger.error(`Error fetching course by ID: ${err.message}`);
      throw err;
    }
  }

  static async update(id, data) {
    try {
      const cours = await Cours.findByIdAndUpdate(
        id,
        { ...data, domaineId: data.domaineId },
        { new: true, runValidators: true }
      );
      if (!cours) throw createError(404, "Cours non trouvé");
      return cours;
    } catch (err) {
      logger.error(`Error updating course: ${err.message}`);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const cours = await Cours.findByIdAndDelete(id);
      if (!cours) throw createError(404, "Cours non trouvé");
      // Delete associated contenus and quizzes
      await Contenu.deleteMany({ cours: id });
      await Quiz.deleteMany({ cours: id });
      // Remove course from domaine
      await Domaine.findByIdAndUpdate(cours.domaineId, {
        $pull: { cours: id },
      });
      return cours;
    } catch (err) {
      logger.error(`Error deleting course: ${err.message}`);
      throw err;
    }
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
      const { page, limit } = req.query;
      const cours = await CoursService.getAll(page, limit);
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
