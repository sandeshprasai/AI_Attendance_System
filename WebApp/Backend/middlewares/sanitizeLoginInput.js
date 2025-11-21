const joi = require("joi");

const sanitizeLoginInput = async (req, res, next) => {
  try {
    const schema = joi.object({
      username: joi.string().required().messages({
        "string.empty": "Username is required",
        "any.required": "Username is required",
      }),
      password: joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
      rememberMe: joi.boolean().messages({
        "boolean.base":
          "Remember Me should be boolean value (Either True or False)",
      }),
    });

    await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    next();
  } catch (error) {
    console.error(`Validation error ${error.message}`);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = sanitizeLoginInput;
