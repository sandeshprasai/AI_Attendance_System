const Joi = require("joi");

// Department validation schema
const departmentSchema = Joi.object({
  DepartmentCode: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Department code must be a number",
      "number.integer": "Department code must be an integer",
      "number.min": "Department code cannot be negative",
      "any.required": "Department code is required",
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
const validateDepartment = (req, res, next) => {
  const { error } = departmentSchema.validate(req.body);
  if (error) {
    // Log the validation error if needed
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next(); // proceed to controller if valid
};

module.exports = validateDepartment;
