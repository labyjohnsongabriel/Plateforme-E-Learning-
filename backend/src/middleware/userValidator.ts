const Joi = require("joi");

exports.update = Joi.object({
  nom: Joi.string(),
  prenom: Joi.string(),
  // etc.
});
exports.changePassword = Joi.object({
  ancienMotDePasse: Joi.string().required(),
  nouveauMotDePasse: Joi.string().min(6).required(),
});
exports.resetPassword = Joi.object({
  email: Joi.string().email().required(),
});
exports.setNewPassword = Joi.object({
  token: Joi.string().required(),
  nouveauMotDePasse: Joi.string().min(6).required(),
});
exports.delete = Joi.object({
  motDePasse: Joi.string().required(),
});
exports.getById = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
exports.getAll = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});
exports.search = Joi.object({
  query: Joi.string().required(),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});
exports.filter = Joi.object({
  role: Joi.string(),
  dateInscription: Joi.date(),
  dernierConnexion: Joi.date(),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});
exports.sort = Joi.object({
  sortBy: Joi.string().valid("nom", "prenom", "email", "dateInscription", "dernierConnexion"),
  order: Joi.string().valid("asc", "desc"),
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
});
exports.getProfile = Joi.object({});
exports.updateProfile = Joi.object({
  nom: Joi.string(),
  prenom: Joi.string(),
  // etc.
});
exports.changeProfilePicture = Joi.object({
  // Assuming you're using multipart/form-data for file uploads
  // No specific validation here, as file validation is typically handled differently
});
exports.deleteProfile = Joi.object({
  motDePasse: Joi.string().required(),
});
exports.getUserStatistics = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date(),
});
exports.getActiveUsers = Joi.object({
  days: Joi.number().min(1).required(),
});
exports.getInactiveUsers = Joi.object({
  days: Joi.number().min(1).required(),
});
bxports.getNewUsers = Joi.object({
    days: Joi.number().min(1).required(),
});
    

