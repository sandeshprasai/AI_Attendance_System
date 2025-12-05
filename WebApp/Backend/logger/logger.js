const { createLogger, format, transports } = require("winston");
const { combine, timestamp, json, printf, colorize, errors } = format;
const DailyRotateFile = require("winston-daily-rotate-file");

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

const logger = createLogger({
  level: "debug",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "10m",
      maxFiles: "14d",
    }),
  ],
});

// Console output
logger.add(
  new transports.Console({
    format: combine(colorize(), timestamp(), consoleFormat),
  })
);

module.exports = logger;
