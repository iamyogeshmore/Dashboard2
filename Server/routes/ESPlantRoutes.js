const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const ESPlantController = require("../controllers/ESPlantController");

// ----------------------- Middleware to validate plantId parameter -----------------------
const validatePlantId = (req, res, next) => {
  const plantId = req.params.plantId;
  if (!plantId || isNaN(parseInt(plantId))) {
    logger.error(`Invalid plant ID: ${plantId}`);
    return res.status(400).json({ 
      status: "error",
      message: `Invalid plant ID: ${plantId}` 
    });
  }
  next();
};

// ----------------------- Middleware to validate terminalId parameter -----------------------
const validateTerminalId = (req, res, next) => {
  const terminalId = req.params.terminalId;
  if (!terminalId || isNaN(parseInt(terminalId))) {
    logger.error(`Invalid terminal ID: ${terminalId}`);
    return res
      .status(400)
      .json({ 
        status: "error",
        message: `Invalid terminal ID: ${terminalId}` 
      });
  }
  next();
};

// ----------------------- Middleware to validate patronId parameter -----------------------
const validatePatronId = (req, res, next) => {
  const patronId = req.params.patronId;
  if (!patronId || isNaN(parseInt(patronId))) {
    logger.error(`Invalid patron ID: ${patronId}`);
    return res.status(400).json({ 
      status: "error",
      message: `Invalid patron ID: ${patronId}` 
    });
  }
  next();
};

// ----------------------- Middleware to validate type parameter -----------------------
const validateType = (req, res, next) => {
  const type = req.query.type;
  const validTypes = ["Terminal", "Measurand", "all"];
  
  if (type && !validTypes.includes(type)) {
    logger.error(`Invalid type parameter: ${type}`);
    return res.status(400).json({
      status: "error",
      message: `Invalid type parameter: ${type}. Allowed values: ${validTypes.join(", ")}`,
    });
  }
  
  // Set default type if not provided
  req.query.type = type || "all";
  next();
};

// ----------------------- Route to get all plants -----------------------
router.get("/", validateType, ESPlantController.getPlants);

// ----------------------- Route to get plants by patronId -----------------------
router.get(
  "/patron/:patronId",
  validatePatronId,
  validateType,
  ESPlantController.getPlantsByPatronId
);

// ----------------------- Route to get terminals for a specific plant -----------------------
router.get(
  "/:plantId/terminals",
  validatePlantId,
  validateType,
  ESPlantController.getTerminals
);

// ----------------------- Route to get measurands for a specific terminal -----------------------
router.get(
  "/:plantId/terminals/:terminalId/measurands",
  validatePlantId,
  validateTerminalId,
  validateType,
  ESPlantController.getMeasurands
);

module.exports = router;
