const Joi = require("joi");

const sanitizeTeacherInputs = (req, res, next) => {
  const Schema = Joi.object({
    EmployeeId: Joi.string().allow("").optional(),

    FullName: Joi.string()
      .required()
      .pattern(/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/)
      .messages({
        "string.pattern.base":
          "Name should contain first and last name",
        "string.empty": "Full Name cannot be empty",
        "any.required": "Full Name is required",
      }),

    DateOfBirth: Joi.string()
      .required()
      .messages({
        "string.empty": "Date of Birth is required",
        "any.required": "Date of Birth is required",
      }),

    FullAddress: Joi.string()
      .required()
      .messages({
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

    Email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Email should be in valid format",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),

    Faculty: Joi.string()
      .valid(
        "Civil Engineering",
        "Computer Engineering",
        "IT Engineering",
        "Electronics & Communication",
        "BBA",
        "Architecture"
      )
      .required()
      .messages({
        "any.only": "Invalid Faculty selected",
        "string.empty": "Faculty is required",
        "any.required": "Faculty is required",
      }),

    Subject: Joi.string()
      .valid(
        "Mathematics",
        "Physics",
        "Chemistry",
        "Operating System",
        "English",
        "DSA",
        "ICT PM",
        "OOP in C++",
        "Economics",
        "SPIT",
        "Cloud Computing",
        "Programming in C"
      )
      .required()
      .messages({
        "any.only": "Invalid Subject selected",
        "string.empty": "Subject is required",
        "any.required": "Subject is required",
      }),

    JoinedYear: Joi.string()
      .required()
      .messages({
        "string.empty": "Joined Year is required",
        "any.required": "Joined Year is required",
      }),

    ProfileImagePath: Joi.any().allow(null),
  });

  const { error } = Schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = sanitizeTeacherInputs;