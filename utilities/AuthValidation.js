import Joi from "joi";

const validateRegister = data => Joi.object({
    userName: Joi.string().trim().min(4).max(255).required(),
    firstName: Joi.string().trim().min(4).max(255).required(),
    lastName: Joi.string().trim().min(4).max(255).required(),
    password: Joi.string().trim().min(6).max(255).required(),
    about: Joi.string().trim().min(6).max(4096).required()
}).validate(data);
  

const validateLogin = data => Joi.object({
  userName: Joi.string().trim().min(4).max(255).required(),
  password: Joi.string().trim().min(6).max(255).required()
}).validate(data);

export  { validateRegister, validateLogin };
