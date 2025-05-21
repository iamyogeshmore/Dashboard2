const winston = require("winston");

// ----------------------- Custom IST timestamp function -----------------------
const timezoneIST = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
};

// ----------------------- Custom log format for JSON output -----------------------
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: timezoneIST }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

// ----------------------- Create Winston logger instance -----------------------
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  defaultMeta: { service: "api-service" },
  transports: [
    // ----------------------- Console transport for colored output -----------------------
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`;
        })
      ),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
