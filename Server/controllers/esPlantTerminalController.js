const ESPlantTerminal = require("../models/ESPlantTerminal");
const logger = require("../utils/logger");

// ----------------------- Fetch MeasurandValue and TimeStamp for a specific TerminalId and MeasurandId -----------------------
exports.getMeasurandValue = async (req, res, next) => {
  try {
    const { terminalId, measurandId } = req.params;

    const terminalIdNum = parseInt(terminalId);
    if (isNaN(terminalIdNum)) {
      logger.warn(`Invalid TerminalId format: ${terminalId}`);
      return res
        .status(400)
        .json({ message: `Invalid TerminalId format: ${terminalId}` });
    }

    if (!measurandId) {
      logger.warn(`Invalid MeasurandId: ${measurandId}`);
      return res
        .status(400)
        .json({ message: `Invalid MeasurandId: ${measurandId}` });
    }

    const record = await ESPlantTerminal.findOne(
      { TerminalId: terminalIdNum },
      "TimeStamp TerminalName MeasurandData"
    )
      .sort({ TimeStamp: -1 })
      .lean()
      .exec();

    if (!record) {
      logger.warn(`No record found for TerminalId: ${terminalIdNum}`);
      return res
        .status(404)
        .json({ message: `No record found for TerminalId: ${terminalIdNum}` });
    }

    // Check if MeasurandData exists and is properly structured
    if (!record.MeasurandData || typeof record.MeasurandData !== "object") {
      logger.warn(
        `MeasurandData not found or invalid for TerminalId: ${terminalIdNum}`
      );
      return res.status(404).json({
        message: `MeasurandData not found for TerminalId: ${terminalIdNum}`,
      });
    }

    // Handle both Map and Object structures
    let measurand;
    if (record.MeasurandData instanceof Map) {
      measurand = record.MeasurandData.get(measurandId);
    } else {
      measurand = record.MeasurandData[measurandId];
    }

    if (!measurand) {
      logger.warn(
        `MeasurandId ${measurandId} not found for TerminalId: ${terminalIdNum}`
      );
      return res.status(404).json({
        message: `MeasurandId ${measurandId} not found for TerminalId: ${terminalIdNum}`,
      });
    }

    const response = {
      MeasurandName: measurand.MeasurandName || `Measurand ${measurandId}`,
      MeasurandValue: measurand.MeasurandValue || 0,
      TimeStamp: record.TimeStamp,
      Unit: measurand.Unit,
    };

    logger.info(
      `Fetched MeasurandValue for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandId}`
    );
    res.status(200).json({
      status: "success",
      message: `Fetched MeasurandValue for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandId}`,
      TerminalId: terminalIdNum,
      data: response,
    });
  } catch (error) {
    logger.error(`Error fetching measurand value: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

module.exports = exports;
