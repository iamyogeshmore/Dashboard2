const ESPlant = require("../models/ESPlant");
const logger = require("../utils/logger");

// ----------------------- Helpers -----------------------
const sendSuccess = (res, message, data = [], extra = {}) => {
  res.status(200).json({
    status: "success",
    message,
    ...extra,
    data,
  });
};

const sendNotFound = (res, message) => {
  res.status(404).json({ 
    status: "error",
    message 
  });
};

const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ 
    status: "error",
    message 
  });
};

// ----------------------- Fetch all plants -----------------------
exports.getPlants = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = {};

    // Validate type parameter
    if (type && !["Terminal", "Measurand", "all"].includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return sendError(res, `Invalid type parameter: ${type}. Allowed values: Terminal, Measurand, all`);
    }

    // Apply type filter
    if (type && type.toLowerCase() !== "all") {
      query.Type = type;
      logger.info(`Filtering plants by type: ${type}`);
    }

    const plants = await ESPlant.find(query)
      .select("_id DisplayName Type PatronId")
      .lean()
      .exec();

    if (!plants.length) {
      logger.info(`No plants found${type ? ` for type: ${type}` : ""}`);
      return sendSuccess(
        res,
        `No plants available${type ? ` for type: ${type}` : ""}`,
        []
      );
    }

    const formatted = plants.map(({ _id, DisplayName, Type, PatronId }) => ({
      plantid: _id,
      PlantName: DisplayName,
      Type,
      PatronId,
    }));

    logger.info(
      `Fetched ${formatted.length} plants${type ? ` for type: ${type}` : ""}`
    );
    sendSuccess(res, `Fetched ${formatted.length} plants`, formatted);
  } catch (error) {
    logger.error(`Error fetching plants: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

// ----------------------- Get terminals by plant ID -----------------------
exports.getTerminals = async (req, res, next) => {
  try {
    const { plantId } = req.params;
    const { type } = req.query;

    // Validate plantId
    const plantIdNum = parseInt(plantId, 10);
    if (isNaN(plantIdNum)) {
      logger.warn(`Invalid plant ID format: ${plantId}`);
      return sendError(res, `Invalid plant ID format: ${plantId}`);
    }

    // Validate type parameter
    if (type && !["Terminal", "Measurand", "all"].includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return sendError(res, `Invalid type parameter: ${type}. Allowed values: Terminal, Measurand, all`);
    }

    let query = { _id: plantIdNum };
    if (type && type.toLowerCase() !== "all") {
      query.Type = type;
      logger.info(`Filtering plant by ID: ${plantId} and type: ${type}`);
    }

    const plant = await ESPlant.findOne(query)
      .select("DisplayName TerminalList Type")
      .lean()
      .exec();

    if (!plant) {
      logger.warn(
        `Plant not found with ID: ${plantId}${type ? ` and type: ${type}` : ""}`
      );
      return sendNotFound(
        res,
        `Plant not found: ${plantId}${type ? ` for type: ${type}` : ""}`
      );
    }

    const terminals = (plant.TerminalList || []).map(
      ({ TerminalId, DisplayName, TerminalName }) => ({
        TerminalId,
        TerminalName: DisplayName || TerminalName,
      })
    );

    if (!terminals.length) {
      logger.info(
        `No terminals found for plant ID: ${plantId}${
          type ? ` and type: ${type}` : ""
        }`
      );
      return sendSuccess(
        res,
        `No terminals found for plant ID: ${plantId}${
          type ? ` for type: ${type}` : ""
        }`,
        [],
        {
          plantName: plant.DisplayName,
          plantType: plant.Type,
        }
      );
    }

    logger.info(
      `Fetched ${terminals.length} terminals for plant ID: ${plantId}${
        type ? ` and type: ${type}` : ""
      }`
    );
    sendSuccess(res, `Fetched ${terminals.length} terminals`, terminals, {
      plantName: plant.DisplayName,
      plantType: plant.Type,
    });
  } catch (error) {
    logger.error(`Error fetching terminals: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

// ----------------------- Get measurands for a terminal -----------------------
exports.getMeasurands = async (req, res, next) => {
  try {
    const { plantId, terminalId } = req.params;
    const { type } = req.query;
    
    // Validate IDs
    const plantIdNum = parseInt(plantId, 10);
    const terminalIdNum = parseInt(terminalId, 10);
    
    if (isNaN(plantIdNum)) {
      logger.warn(`Invalid plant ID format: ${plantId}`);
      return sendError(res, `Invalid plant ID format: ${plantId}`);
    }
    
    if (isNaN(terminalIdNum)) {
      logger.warn(`Invalid terminal ID format: ${terminalId}`);
      return sendError(res, `Invalid terminal ID format: ${terminalId}`);
    }

    // Validate type parameter
    if (type && !["Terminal", "Measurand", "all"].includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return sendError(res, `Invalid type parameter: ${type}. Allowed values: Terminal, Measurand, all`);
    }

    let query = { _id: plantIdNum };
    if (type && type.toLowerCase() !== "all") {
      query.Type = type;
      logger.info(`Filtering plant by ID: ${plantId} and type: ${type}`);
    }

    const plant = await ESPlant.findOne(query)
      .select("DisplayName TerminalList MeasurandList Type")
      .lean()
      .exec();

    if (!plant) {
      logger.warn(
        `Plant not found with ID: ${plantId}${type ? ` and type: ${type}` : ""}`
      );
      return sendNotFound(
        res,
        `Plant not found: ${plantId}${type ? ` for type: ${type}` : ""}`
      );
    }

    const terminal = (plant.TerminalList || []).find(
      (t) => t.TerminalId === terminalIdNum
    );
    if (!terminal) {
      logger.warn(
        `Terminal not found with ID: ${terminalId} in plant ID: ${plantId}${
          type ? ` and type: ${type}` : ""
        }`
      );
      return sendNotFound(
        res,
        `Terminal not found with ID: ${terminalId} in plant ID: ${plantId}${
          type ? ` for type: ${type}` : ""
        }`
      );
    }

    const measurands = (plant.MeasurandList || []).map(
      ({ MeasurandId, DisplayName, DisplayUnit, MeasurandName, Unit }) => ({
        MeasurandId,
        MeasurandName: DisplayName || MeasurandName,
        Unit: DisplayUnit || Unit,
      })
    );

    if (!measurands.length) {
      logger.info(
        `No measurands for plant ID: ${plantId}, terminal ID: ${terminalId}${
          type ? ` and type: ${type}` : ""
        }`
      );
      return sendSuccess(res, `No measurands found`, [], {
        plantName: plant.DisplayName,
        plantType: plant.Type,
        terminalName: terminal.DisplayName || terminal.TerminalName,
      });
    }

    logger.info(
      `Fetched ${measurands.length} measurands for terminal ${terminalId}${
        type ? ` and type: ${type}` : ""
      }`
    );
    sendSuccess(res, `Fetched ${measurands.length} measurands`, measurands, {
      plantName: plant.DisplayName,
      plantType: plant.Type,
      terminalName: terminal.DisplayName || terminal.TerminalName,
    });
  } catch (error) {
    logger.error(`Error fetching measurands: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

// ----------------------- Get plants by PatronId -----------------------
exports.getPlantsByPatronId = async (req, res, next) => {
  try {
    const { patronId } = req.params;
    const { type } = req.query;

    // Validate patronId
    const patronIdNum = parseInt(patronId, 10);
    if (isNaN(patronIdNum)) {
      logger.warn(`Invalid patron ID format: ${patronId}`);
      return sendError(res, `Invalid patron ID format: ${patronId}`);
    }

    // Validate type parameter
    if (type && !["Terminal", "Measurand", "all"].includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return sendError(res, `Invalid type parameter: ${type}. Allowed values: Terminal, Measurand, all`);
    }

    let query = { PatronId: patronIdNum };
    if (type && type.toLowerCase() !== "all") {
      query.Type = type;
      logger.info(
        `Filtering plants by PatronId: ${patronId} and type: ${type}`
      );
    }

    const plants = await ESPlant.find(query)
      .select("_id DisplayName Type PatronId")
      .lean()
      .exec();

    if (!plants.length) {
      logger.info(
        `No plants found for PatronId: ${patronId}${
          type ? ` and type: ${type}` : ""
        }`
      );
      return sendSuccess(
        res,
        `No plants available for PatronId: ${patronId}${
          type ? ` for type: ${type}` : ""
        }`,
        []
      );
    }

    const formatted = plants.map(({ _id, DisplayName, Type, PatronId }) => ({
      plantid: _id,
      PlantName: DisplayName,
      Type,
      PatronId,
    }));

    logger.info(
      `Fetched ${formatted.length} plants for PatronId: ${patronId}${
        type ? ` and type: ${type}` : ""
      }`
    );
    sendSuccess(res, `Fetched ${formatted.length} plants`, formatted, {
      patronId: patronIdNum,
    });
  } catch (error) {
    logger.error(`Error fetching plants by PatronId: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

module.exports = exports;
