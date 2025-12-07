const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);

const sanitizeTeacherInputs = (req, res, next) => {
  const Schema = Joi.object({
    FullName: Joi.string()
      .required()
      .pattern(/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/)
      .messages({
        "string.pattern.base":
          "Name should at least contain first and last name",
        "string.empty": "Full Name cannot be empty",
        "any.required": "Full Name is required",
      }),

    Email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .messages({
        "string.empty": "Email address is required",
        "string.pattern.base": "Email should be in a valid format",
        "any.required": "Email is required",
      }),

    Phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be 10 digits",
        "string.empty": "Phone number is required",
        "any.required": "Phone number is required",
      }),

    Departments: Joi.string().required().messages({
      "string.empty": "Department is required",
      "any.required": "Department is required",
    }),

    AssignedClass: Joi.array()
      .items(
        Joi.number().integer().positive().messages({
          "number.base": "Class ID must be a number",
          "number.integer": "Class ID must be an integer",
          "number.positive": "Class ID must be a positive number",
        })
      )
      .optional()
      .messages({
        "array.base": "AssignedClass must be an array",
        "array.includes": "Invalid class ID format",
      }),
  });

  const { error } = Schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (error)
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });

  next();
};

module.exports = sanitizeTeacherInputs;
