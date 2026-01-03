const Joi = require("joi");

const validateClass = (req, res, next) => {
  // Normalize single → bulk
  if (req.body.Class) {
    req.body = {
      classes: [req.body],
    };
  }

  const Schema = Joi.object({
    classes: Joi.array()
      .items(
        Joi.object({
          Class: Joi.string().required().messages({
            "any.required": "Class is required",
          }),

          Capacity: Joi.number().integer().min(1).required().messages({
            "number.base": "Capacity must be a number",
            "number.integer": "Capacity must be an integer",
            "number.min": "Capacity must be greater than 0",
            "any.required": "Capacity is required",
          }),

          Description: Joi.string().max(100).allow("", null).messages({
            "string.max": "Description must not exceed 100 characters",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "Classes must be an array",
        "array.min": "At least one class is required",
        "any.required": "Classes are required",
      }),
  });

  const { error } = Schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next();
};

module.exports = validateClass;
