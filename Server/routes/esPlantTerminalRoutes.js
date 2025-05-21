const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const esPlantTerminalController = require("../controllers/esPlantTerminalController");

// ----------------------- Middleware to validate TerminalId -----------------------
const validateTerminalId = (req, res, next) => {
  const terminalId = req.params.terminalId;
  if (!terminalId || isNaN(parseInt(terminalId))) {
    logger.error(`Invalid TerminalId: ${terminalId}`);
    return res.status(400).json({ message: "Invalid TerminalId format" });
  }
  next();
};

// ----------------------- Middleware to validate MeasurandId -----------------------
const validateMeasurandId = (req, res, next) => {
  const measurandId = req.params.measurandId;
  if (!measurandId) {
    logger.error(`Invalid MeasurandId: ${measurandId}`);
    return res.status(400).json({ message: "Invalid MeasurandId format" });
  }
  next();
};

// ----------------------- Route to get MeasurandValue and TimeStamp -----------------------
router.get(
  "/:terminalId/measurands/:measurandId",
  validateTerminalId,
  validateMeasurandId,
  esPlantTerminalController.getMeasurandValue
);

module.exports = router;
