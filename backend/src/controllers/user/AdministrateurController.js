const StatisticsService = require("../../services/report/StatisticsService");
const UserService = require("../../services/user/UserService"); // Pour gestion users
//const CoursService = require("../../services/learning/CoursService"); // Pour gestion cours

// Stats globales
exports.getGlobalStats = async (req, res, next) => {
  try {
    const stats = await StatisticsService.getGlobalStats();
    res.json(stats);
  } catch (err) {
    console.error("Erreur controller getGlobalStats:", err);
    next(err);
  }
};

// Stats par utilisateur (pour admin visualisant un user)
exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await StatisticsService.getUserStats(req.params.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Stats par cours
exports.getCourseStats = async (req, res, next) => {
  try {
    const stats = await StatisticsService.getCourseStats(req.params.coursId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Gestion utilisateurs (CRUD pour admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers(); // Implémentez dans UserService
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updated = await UserService.updateUser(req.params.userId, req.body); // e.g., changer role
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.params.userId);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    next(err);
  }
};

// Gestion cours (CRUD pour admin)
exports.createCourse = async (req, res, next) => {
  try {
    const course = await CoursService.createCourse(req.body, req.user.id); // createur = admin
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await CoursService.getAllCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const updated = await CoursService.updateCourse(
      req.params.coursId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    await CoursService.deleteCourse(req.params.coursId);
    res.json({ message: "Cours supprimé" });
  } catch (err) {
    next(err);
  }
};
