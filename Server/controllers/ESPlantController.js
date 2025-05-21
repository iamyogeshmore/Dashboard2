const ESPlant = require("../models/ESPlant");
const logger = require("../utils/logger");

// ----------------------- Helpers -----------------------
const sendSuccess = (res, message, data = [], extra = {}) => {
  res.status(200).json({
    message,
    count: data.length,
    ...extra,
    data,
  });
};

const sendNotFound = (res, message) => {
  res.status(404).json({ message });
};

// ----------------------- Fetch all plants -----------------------
exports.getPlants = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = {};

    // Apply type filter if provided and not 'all'
    if (type && type.toLowerCase() !== "all") {
      query = { Type: type };
      logger.info(`Filtering plants by type: ${type}`);
    }

    const plants = await ESPlant.find(query).select("_id DisplayName").lean();

    if (!plants.length) {
      logger.info(`No plants found${type ? ` for type: ${type}` : ""}`);
      return sendSuccess(
        res,
        `No plants available${type ? ` for type: ${type}` : ""}`
      );
    }

    const formatted = plants.map(({ _id, DisplayName }) => ({
      plantid: _id,
      PlantName: DisplayName,
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

    let query = { _id: plantId };
    if (type && type.toLowerCase() !== "all") {
      query.Type = type;
      logger.info(`Filtering plant by ID: ${plantId} and type: ${type}`);
    }

    const plant = await ESPlant.findOne(query)
      .select("DisplayName TerminalList")
      .lean();

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
      ({ TerminalId, DisplayName }) => ({
        TerminalId,
        TerminalName: DisplayName,
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
    const terminalIdNum = parseInt(terminalId, 10);

    let query = { _id: plantId };
    if (type && type.toLowerCase() !== "all") {
      query.Type = type;
      logger.info(`Filtering plant by ID: ${plantId} and type: ${type}`);
    }

    const plant = await ESPlant.findOne(query)
      .select("DisplayName TerminalList MeasurandList")
      .lean();

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
      ({ MeasurandId, DisplayName, Unit }) => ({
        MeasurandId,
        MeasurandName: DisplayName,
        Unit,
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
        terminalName: terminal.DisplayName,
      });
    }

    logger.info(
      `Fetched ${measurands.length} measurands for terminal ${terminalId}${
        type ? ` and type: ${type}` : ""
      }`
    );
    sendSuccess(res, `Fetched ${measurands.length} measurands`, measurands, {
      plantName: plant.DisplayName,
      terminalName: terminal.DisplayName,
    });
  } catch (error) {
    logger.error(`Error fetching measurands: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

module.exports = exports;
