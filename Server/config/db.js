const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    // ----------------------- Establish MongoDB connection -----------------------
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // ----------------------- Log successful connection -----------------------
    const dbName = conn.connection.db.databaseName;
    logger.info(`MongoDB Connected: ${dbName}`);

    // ----------------------- Handle connection errors -----------------------
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`, {
        stack: err.stack,
      });
    });

    // ----------------------- Handle disconnection events -----------------------
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // ----------------------- Handle graceful shutdown on SIGINT -----------------------
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    // ----------------------- Log and exit on connection failure -----------------------
    logger.error(`MongoDB Connection Error: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
};

module.exports = connectDB;
