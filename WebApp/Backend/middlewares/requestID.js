const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
};
