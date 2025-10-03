const Joi = require("joi");
const StatutInscription = require("../models/enums/StatutInscription");

module.exports = {
  enroll: Joi.object({
    coursId: Joi.string().required(),
  }),
  updateProgress: Joi.object({
    pourcentage: Joi.number().min(0).max(100).required(),
  }),
  updateStatus: Joi.object({
    statut: Joi.string()
      .valid(...Object.values(StatutInscription))
      .required(),
  }),
};
