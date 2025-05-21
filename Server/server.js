const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const ESPlantRoutes = require("./routes/ESPlantRoutes");
const esPlantTerminalRoutes = require("./routes/esPlantTerminalRoutes");
const hdNutsGraphRoutes = require("./routes/hdNutsGraphRoutes");
const { initializeWebSocket } = require("./websocket");
const http = require("http");

// ----------------------- Load environment variables from .env file -----------------------
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8008;

// ----------------------- Create HTTP server -----------------------
const server = http.createServer(app);

// ----------------------- Initialize WebSocket -----------------------
initializeWebSocket(server);

// ----------------------- Apply middleware for parsing JSON and URL-encoded data -----------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ----------------------- Enable CORS for cross-origin requests -----------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  })
);

// ----------------------- Log incoming requests -----------------------
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ----------------------- Connect to MongoDB database -----------------------
connectDB();

// ----------------------- Health check endpoint -----------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ----------------------- API routes -----------------------
app.use("/api/plants", ESPlantRoutes);
app.use("/api/live-value", esPlantTerminalRoutes);
app.use("/api/history", hdNutsGraphRoutes);

// ----------------------- Handle 404 for undefined routes -----------------------
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.url} not found`,
  });
});

// ----------------------- Apply custom error handling middleware -----------------------
app.use(errorHandler);

// ----------------------- Start the server -----------------------
server.listen(PORT, () => {
  logger.info(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// ----------------------- Handle unhandled promise rejections -----------------------
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }
});

// ----------------------- Handle uncaught exceptions -----------------------
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
