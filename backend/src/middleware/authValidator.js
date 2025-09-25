const Joi = require("joi");

exports.register = Joi.object({
  nom: Joi.string().required(),
  prenom: Joi.string().required(),
  email: Joi.string().email().required(),
  motDePasse: Joi.string().min(6).required(),
  role: Joi.string().required(),
});

exports.login = Joi.object({
  email: Joi.string().email().required(),
  motDePasse: Joi.string().required(),
});
