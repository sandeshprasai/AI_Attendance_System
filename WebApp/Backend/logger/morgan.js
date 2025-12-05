const morgan = require("morgan");
const logger = require("./logger");

// Tokens for user and IP
morgan.token("user", (req) => (req.user ? req.user.id : "guest"));
morgan.token("ip", (req) => req.ip);

// Stream logs to Winston
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Skip unwanted requests: static files, OPTIONS, public folder
const skipFn = (req) => {
  const url = req.url || "";
  return (
    req.method === "OPTIONS" ||
    url.startsWith("/public") ||
    url.match(/\.(css|js|png|jpg|jpeg|svg|ico)$/i)
  );
};

// Format: method, URL, status, response time, user ID, IP
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms - user::user - ip::ip",
  { stream, skip: skipFn }
);

module.exports = morganMiddleware;
