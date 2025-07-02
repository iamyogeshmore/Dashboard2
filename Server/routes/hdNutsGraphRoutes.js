const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const hdNutsGraphController = require("../controllers/hdNutsGraphController");

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
  if (!measurandId || isNaN(parseInt(measurandId))) {
    logger.error(`Invalid MeasurandId: ${measurandId}`);
    return res.status(400).json({ message: "Invalid MeasurandId format" });
  }
  next();
};

// ----------------------- Route to get last 900 records -----------------------
router.get(
  "/:terminalId/measurands/:measurandId/last-900",
  validateTerminalId,
  validateMeasurandId,
  hdNutsGraphController.getLast900Records
);

// ----------------------- Route to get records by date range -----------------------
router.get(
  "/:terminalId/measurands/:measurandId/date-range",
  validateTerminalId,
  validateMeasurandId,
  hdNutsGraphController.getRecordsByDateRange
);

// Get MeasurandValue from HDNuts900 or HDNutsGraph based on profile
router.get('/measurand-value', hdNutsGraphController.getMeasurandValue);

module.exports = router;
