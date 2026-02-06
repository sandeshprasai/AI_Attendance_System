const Joi = require("joi");

// Define the single Subject validation schema
const singleSubjectSchema = Joi.object({
  SubjectCode: Joi.string().trim().min(1).required().messages({
    "any.required": "Subject code is required",
    "string.empty": "Subject code cannot be empty",
  }),
  SubjectName: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Subject name must be a string",
    "string.max": "Subject name must not exceed 100 characters",
    "any.required": "Subject name is required",
    "string.empty": "Subject name cannot be empty",
  }),
  DepartmentName: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Department name must be a string",
    "string.max": "Department name must not exceed 100 characters",
    "any.required": "Department name is required",
    "string.empty": "Department name cannot be empty",
  }),
  Semester: Joi.number()
  .strict()        // 🔥 prevents "" or "3"
  .integer()
  .min(1)
  .max(10)
  .required()
  .messages({
    "number.base": "Semester must be a valid number",
    "number.min": "Semester should be between 1 to 10",
    "number.max": "Semester should be between 1 to 10",
    "any.required": "Semester is required",
  }),

}).unknown(false);

// Define an array of subjects schema
const subjectArraySchema = Joi.array()
  .items(singleSubjectSchema)
  .min(1)
  .required()
  .messages({
    "array.base": "Request body must be an array of subjects",
    "array.min": "At least one subject is required",
    "any.required": "Subjects array is required",
  });

// Middleware function
const validateSubjects = (req, res, next) => {
  const { error } = subjectArraySchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    // Collect all error messages
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }
  next();
};

module.exports = validateSubjects;
