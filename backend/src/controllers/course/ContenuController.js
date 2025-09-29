// controllers/course/ContenuController.js
const createError = require("http-errors");
const mongoose = require("mongoose"); // Ajouté pour clarté
const Contenu = require("../../models/course/Contenu");
const Cours = require("../../models/course/Cours"); // Importation explicite

class ContenuService {
  static async create(data, file) {
    if (file) data.url = `/uploads/${file.filename}`; // Gestion d'upload
    const contenu = new Contenu(data);
    await contenu.save();
    // Ajouter au cours
    await Cours.findByIdAndUpdate(data.cours, {
      $push: { contenus: contenu._id },
    });
    return contenu;
  }

  static async getAll() {
    return Contenu.find().populate("cours");
  }

  static async getById(id) {
    const contenu = await Contenu.findById(id).populate("cours");
    if (!contenu) throw createError(404, "Contenu non trouvé");
    return contenu;
  }

  static async update(id, data, file) {
    if (file) data.url = `/uploads/${file.filename}`;
    const contenu = await Contenu.findByIdAndUpdate(id, data, { new: true });
    if (!contenu) throw createError(404, "Contenu non trouvé");
    return contenu;
  }

  static async delete(id) {
    const contenu = await Contenu.findByIdAndDelete(id);
    if (!contenu) throw createError(404, "Contenu non trouvé");
    return contenu;
  }
}

module.exports = {
  create: async (req, res, next) => {
    try {
      const contenu = await ContenuService.create(req.body, req.file);
      res.status(201).json(contenu);
    } catch (err) {
      next(err);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const contenus = await ContenuService.getAll();
      res.json(contenus);
    } catch (err) {
      next(err);
    }
  },
  getById: async (req, res, next) => {
    try {
      const contenu = await ContenuService.getById(req.params.id);
      res.json(contenu);
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const contenu = await ContenuService.update(
        req.params.id,
        req.body,
        req.file
      );
      res.json(contenu);
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const contenu = await ContenuService.delete(req.params.id);
      res.json({ message: "Contenu supprimé" });
    } catch (err) {
      next(err);
    }
  },
};
