import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import logger from "./logger";

logger.info("Connecting Database...");

if (process.env.DATABASE_CONNECTIONURI) {
  mongoose.connect(process.env.DATABASE_CONNECTIONURI).catch((e) => {
    logger.error("Failed to Connect to Database", { stack: e });
  });
} else {
  logger.error("DATABASE_CONNECTIONURI is not defined in .env file");
}

const database = mongoose.connection;

database.on("error", (e: any) => {
  logger.error("Failed to connect to Database", { stack: e });
});

database.on("connected", () => {
  logger.info("Database has been Connected");
});

export default database;
