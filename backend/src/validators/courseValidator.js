const Joi = require("joi");
const NiveauFormation = require("../../src/models/enums/NiveauFormation");

module.exports = {
  create: Joi.object({
    titre: Joi.string().required(),
    description: Joi.string().required(),
    domaine: Joi.string().required(), // ObjectId as string
    niveau: Joi.string()
      .valid(...Object.values(NiveauFormation))
      .required(),
  }),
  update: Joi.object({
    titre: Joi.string(),
    description: Joi.string(),
    domaine: Joi.string(),
    niveau: Joi.string().valid(...Object.values(NiveauFormation)),
  }),
  createContenu: Joi.object({
    titre: Joi.string().required(),
    description: Joi.string(),
    cours: Joi.string().required(),
    type: Joi.string().valid("video", "document").required(),
    // File handled separately
  }),
  updateContenu: Joi.object({
    titre: Joi.string(),
    description: Joi.string(),
  }),
  createQuiz: Joi.object({
    titre: Joi.string().required(),
    cours: Joi.string().required(),
  }),
  updateQuiz: Joi.object({
    titre: Joi.string(),
  }),
};
