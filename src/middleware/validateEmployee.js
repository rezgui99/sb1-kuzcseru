const Joi = require("joi");

const employeeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  position: Joi.string().min(3).max(100).required(),
  hire_date: Joi.date().iso().required(),
  email: Joi.string().email().required(), // renommé depuis contact_info
  phone: Joi.string()
    .pattern(/^\+?[0-9\s\-]{7,20}$/)
    .allow(null, ""), // optionnel
  gender: Joi.string().valid("Homme", "Femme", "Autre").allow(null), // optionnel
  location: Joi.string().max(100).allow(null, ""), // optionnel
  notes: Joi.string().allow(null, ""), // optionnel
});

module.exports = function validateEmployee(req, res, next) {
  const { error } = employeeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Erreur de validation",
      details: error.details.map((err) => err.message),
    });
  }
  next();
};
