const Joi = require("joi");

const sanitizeTeacherInputs = (req, res, next) => {
  // Convert single subjects to array
  if (req.body.Subject && !Array.isArray(req.body.Subject)) {
    req.body.Subject = [req.body.Subject];
  }

  // Assign ProfileImagePath from multer
  if (req.file) {
    req.body.ProfileImagePath = req.file.originalname;
  }

  const Schema = Joi.object({
    EmployeeId: Joi.string().required().messages({
      "string.empty": "Employee ID is required",
      "any.required": "Employee ID is required",
    }),
    FullName: Joi.string()
      .required()
      .pattern(/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/)
      .messages({
        "string.pattern.base": "Full Name should contain first and last name",
        "string.empty": "Full Name cannot be empty",
        "any.required": "Full Name is required",
      }),
    DateOfBirth: Joi.string().required().messages({
      "string.empty": "Date of Birth is required",
      "any.required": "Date of Birth is required",
    }),
    FullAddress: Joi.string().required().messages({
      "string.empty": "Address is required",
      "any.required": "Address is required",
    }),
    Phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be 10 digits",
        "string.empty": "Phone number is required",
        "any.required": "Phone number is required",
      }),
    Email: Joi.string().email().required().messages({
      "string.email": "Email should be in valid format",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    Faculty: Joi.string().required().messages({
      "string.empty": "Faculty is required",
      "any.required": "Faculty is required",
    }),
    Subject: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required()
      .messages({
        "array.base": "Subjects must be an array",
        "array.min": "At least one subject must be selected",
        "any.required": "Subjects are required",
      }),
    JoinedYear: Joi.string()
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        "string.pattern.base": "Joined Year must be a 4-digit year",
        "string.empty": "Joined Year is required",
        "any.required": "Joined Year is required",
      }),
    ProfileImagePath: Joi.string()
      .required()
      .messages({
        "string.empty": "Profile image is required",
        "any.required": "Profile image is required",
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

module.exports = sanitizeTeacherInputs;