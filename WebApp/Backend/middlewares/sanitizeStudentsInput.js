const joi = require("joi");

const sanitizeStudentInput = async (req, res, next) => {
  const Schema = joi.object({
    FullName: joi
      .string()
      .required()
      .pattern(/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/)
      .messages({
        "string.pattern.base": "Name should contain first and last name",
        "string.empty": "Full Name cannot be empty",
        "any.required": "Full Name is required",
      }),

    RollNo: joi.number().integer().positive().required().messages({
      "number.base": "Roll Number can only contain Numbers",
      "number.positive": "Roll No can only be positive",
      "number.integer": "Roll No can only be integer",
      "any.required": "Roll No cannot be left empty",
    }),

    Faculty: joi
      .string()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "string.empty": "Faculty is required",
        "string.pattern.base": "Faculty can only contain letters and spaces",
      }),

    YearOfEnrollment: joi
      .number()
      .integer()
      .min(1990)
      .max(new Date().getFullYear())
      .required()
      .messages({
        "number.base": "Year of enrollment must be a valid year",
        "number.min": "Year of enrollment must be after 1990",
        "number.max": "Year of enrollment cannot be in the future",
        "any.required": "Year of Enrollment is required",
      }),

    Email: joi
      .string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .messages({
        "string.empty": "Email address is required",
        "string.pattern.base": "Email should be in a valid format",
      }),

    Phone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be 10 digits",
        "string.empty": "Phone number is required",
      }),

    DateOfBirth: joi.date().max("now").required().messages({
      "date.base": "Date of birth must be a valid date",
      "date.max": "Date of birth cannot be in the future",
      "any.required": "Date of birth is required",
    }),
    GuardianName: joi.string().optional().messages({
      "string.empty": "Guardian Name is required",
    }),

    GuardianPhone: joi
      .string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        "string.pattern.base": "Guardian Phone number must be 10 digits",
        "string.empty": "Guardian Phone number is required",
      }),
    Section: joi.string().required().messages({
      "string.empty": "Section is requird",
      "any.required": "Section is required",
    }),
    Class: joi.string().required().messages({
      "string.empty": "Class is required",
    }),

    Section: joi.string().required().messages({
      "string.empty": "Section is required",
    }),

    FullAddress: joi.string().required().min(5).messages({
      "string.empty": "Full Address is required",
      "string.min": "Address must be at least 5 characters long",
    }),

    Subjects: joi
      .array()
      .items(
        joi
          .string()
          .trim()
          .pattern(/^[A-Za-z\s]+$/)
          .messages({
            "string.pattern.base":
              "Subject Name can contain only letter and spaces",
            "string.empty": "Subjects name cannot be empty",
          }),
      )
      .min(1)
      .unique()
      .required()
      .messages({
        "array.base": "Subjects must be an array",
        "array.min": "At least one subjects is required",
        "any.required": "Subjects field are required",
      }),

    UniversityReg: joi.string().required().messages({
      "string.empty": "University Registration is required",
    }),
    ProfileImagePath: joi.any().allow(null).optional(),
  });

  try {
    await Schema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      })),
    });
  }
};

module.exports = sanitizeStudentInput;
