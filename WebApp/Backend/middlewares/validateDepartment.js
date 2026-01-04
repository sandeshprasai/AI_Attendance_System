const Joi = require("joi");

// Department validation schema for individual department
const departmentSchema = Joi.object({
  DepartmentCode: Joi.string().required().messages({
    "any.required": "Department code is required",
  }),
  DepartmentName: Joi.string().trim().max(100).required().messages({
    "string.base": "Department name must be a string",
    "string.max": "Department name must not exceed 100 characters",
    "any.required": "Department name is required",
  }),
});

// Schema to validate an array of departments
const departmentsArraySchema = Joi.array()
  .items(departmentSchema)
  .min(1) // Ensures at least one department in the array
  .required()
  .messages({
    "array.base": "Request body must be an array",
    "array.min": "At least one department is required",
    "any.required": "Departments are required",
  });

// Middleware function to validate an array of departments
const validateDepartments = (req, res, next) => {
  const { error } = departmentsArraySchema.validate(req.body);

  if (error) {
    // Log the validation error if needed
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  next(); // Proceed to controller if valid
};

module.exports = validateDepartments;
