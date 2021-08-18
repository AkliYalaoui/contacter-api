import Joi from "joi";

const validateUpdate = (data) =>
  Joi.object({
    userName: Joi.string().trim().min(4).max(255).required(),
    firstName: Joi.string().trim().min(4).max(255).required(),
    lastName: Joi.string().trim().min(4).max(255).required(),
    about: Joi.string().trim().min(6).max(4096).required(),
    password: Joi.string(),
  }).validate(data);

const validatePassword = (data) =>
  Joi.object({
    password: Joi.string().trim().min(6).max(255).required(),
  }).validate(data);

export { validateUpdate, validatePassword };
