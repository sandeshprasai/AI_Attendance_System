const Joi = require("joi");

// Define the Subject validation schema
const subjectSchema = Joi.object({
  SubjectCode: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Subject code must be a number",
      "number.integer": "Subject code must be an integer",
      "number.min": "Subject code cannot be negative",
      "any.required": "Subject code is required",
    }),

  SubjectName: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      "string.base": "Subject name must be a string",
      "string.max": "Subject name must not exceed 100 characters",
      "any.required": "Subject name is required",
    }),

  DepartmentName: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      "string.base": "Department name must be a string",
      "string.max": "Department name must not exceed 100 characters",
      "any.required": "Department name is required",
    }),
});

// Middleware function
const validateSubject = (req, res, next) => {
  const { error } = subjectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next(); 
};

module.exports = validateSubject;
