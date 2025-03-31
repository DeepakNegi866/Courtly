import { createLogger, format, transports } from "winston";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Helper function to ensure environment variables are defined
const getEnv = (variable: string, defaultValue: string): string => {
  const value = process.env[variable];
  if (!value) {
    console.warn(
      `Environment variable ${variable} is not set. Using default value: ${defaultValue}`
    );
    return defaultValue;
  }
  return value;
};

const logger = createLogger({
  format: format.combine(
    format.metadata(),
    format.timestamp({
      format: getEnv("LOG_DATEFORMAT", "YYYY-MM-DD HH:mm:ss"),
    }), // Default date format
    format.printf((info: any) => {
      const { level, message, timestamp, ...meta } = info;
      let metadata = meta.metadata;
      return `${level}: ${timestamp} :- ${message} ${
        Object.keys(metadata).length > 0 ? `\n ${JSON.stringify(metadata)}` : ""
      }`;
    })
  ),
  transports: [
    new transports.File({
      filename: `${getEnv("LOG_LOGDIRECTORY", "logs")}/combined.log`, // Default directory
      maxsize: parseInt(getEnv("LOG_MAXFILESIZE", "1048576"), 10), // Default file size
      maxFiles: parseInt(getEnv("LOG_MAXFILES", "5"), 10), // Default file count
    }),
    new transports.File({
      level: "error",
      filename: `${getEnv("LOG_LOGDIRECTORY", "logs")}/error.log`, // Default directory
      maxsize: parseInt(getEnv("LOG_MAXFILESIZE", "1048576"), 10), // Default file size
      maxFiles: parseInt(getEnv("LOG_MAXFILES", "5"), 10), // Default file count
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf((info: any) => {
          const { level, message, timestamp, ...meta } = info;
          let metadata = meta.metadata;
          return `${level}: ${message} ${
            Object.keys(metadata).length > 0
              ? `\n ${JSON.stringify(metadata)}`
              : ""
          }`;
        })
      ),
    })
  );
}

export default logger;
