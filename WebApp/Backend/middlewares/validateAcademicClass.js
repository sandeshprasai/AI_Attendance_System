const Joi = require("joi");

const academicClassSchema = Joi.object({
  ClassName: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Class name must be a string",
    "string.empty": "Class name cannot be empty",
    "string.max": "Class name must not exceed 100 characters",
    "any.required": "Class name is required",
  }),

  ClassCode: Joi.string().trim().uppercase().min(1).required().messages({
    "string.base": "Class code must be a string",
    "string.empty": "Class code cannot be empty",
    "any.required": "Class code is required",
  }),

  PhysicalClassroom: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Physical classroom must be a valid ObjectId",
      "any.required": "Physical classroom is required",
    }),

  Department: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Department must be a valid ObjectId",
      "any.required": "Department is required",
    }),

  Subject: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Subject must be a valid ObjectId",
      "any.required": "Subject is required",
    }),

  Teacher: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Teacher must be a valid ObjectId",
      "any.required": "Teacher is required",
    }),

  Students: Joi.array()
    .items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
        "string.pattern.base": "Each student ID must be a valid ObjectId",
      })
    )
    .optional()
    .messages({
      "array.base": "Students must be an array",
    }),

  Semester: Joi.number().strict().integer().min(1).max(10).required().messages({
    "number.base": "Semester must be a valid number",
    "number.integer": "Semester must be an integer",
    "number.min": "Semester must be between 1 and 10",
    "number.max": "Semester must be between 1 and 10",
    "any.required": "Semester is required",
  }),

  AcademicYear: Joi.string().trim().required().messages({
    "string.base": "Academic year must be a string",
    "string.empty": "Academic year cannot be empty",
    "any.required": "Academic year is required",
  }),

  Section: Joi.string().trim().uppercase().max(2).optional().messages({
    "string.base": "Section must be a string",
    "string.max": "Section must not exceed 2 characters",
  }),

  MaxCapacity: Joi.number().integer().min(1).optional().messages({
    "number.base": "Max capacity must be a number",
    "number.integer": "Max capacity must be an integer",
    "number.min": "Max capacity must be at least 1",
  }),

  Description: Joi.string().trim().max(500).optional().messages({
    "string.base": "Description must be a string",
    "string.max": "Description must not exceed 500 characters",
  }),
}).unknown(false);

const validateAcademicClass = (req, res, next) => {
  const { error } = academicClassSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  next();
};

module.exports = validateAcademicClass;
