const HDNutsGraph = require("../models/HDNutsGraph");
const ESPlant = require("../models/ESPlant");
const logger = require("../utils/logger");
const HDNuts900 = require('../models/HDNuts900');

// ----------------------- Get last 900 records -----------------------
exports.getLast900Records = async (req, res, next) => {
  try {
    const { terminalId, measurandId } = req.params;
    const terminalIdNum = parseInt(terminalId);
    const measurandIdNum = parseInt(measurandId);

    if (isNaN(terminalIdNum)) {
      logger.warn(`Invalid TerminalId format: ${terminalId}`);
      return res
        .status(400)
        .json({ message: `Invalid TerminalId format: ${terminalId}` });
    }
    if (isNaN(measurandIdNum)) {
      logger.warn(`Invalid MeasurandId format: ${measurandId}`);
      return res
        .status(400)
        .json({ message: `Invalid MeasurandId format: ${measurandId}` });
    }

    const plant = await ESPlant.findOne(
      { "TerminalList.TerminalId": terminalIdNum },
      { MeasurandList: 1 }
    ).lean();
    const measurand = plant?.MeasurandList.find(
      (m) => m.MeasurandId === measurandIdNum
    );

    const records = await HDNutsGraph.aggregate([
      { $match: { TerminalId: terminalIdNum } },
      { $sort: { TimeStamp: -1 } },
      { $limit: 900 },
      { $unwind: "$MeasurandData" },
      { $match: { "MeasurandData.MeasurandId": measurandIdNum } },
      {
        $project: {
          MeasurandId: "$MeasurandData.MeasurandId",
          MeasurandName:
            measurand?.DisplayName || "$MeasurandData.MeasurandName",
          MeasurandValue: "$MeasurandData.MeasurandValue",
          TimeStamp: 1,
          _id: 0,
        },
      },
    ]).exec();

    if (!records.length) {
      logger.info(
        `No records found for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}`
      );
      return res.status(200).json({
        message: `No records found for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}`,
        count: 0,
        data: [],
      });
    }

    logger.info(
      `Fetched ${records.length} records for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}`
    );
    res.status(200).json({
      message: `Fetched ${records.length} records for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}`,
      count: records.length,
      data: records,
    });
  } catch (error) {
    logger.error(`Error fetching last 900 records: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

// ----------------------- Get records by date range -----------------------
exports.getRecordsByDateRange = async (req, res, next) => {
  try {
    const { terminalId, measurandId } = req.params;
    const { from, to } = req.query;
    const terminalIdNum = parseInt(terminalId);
    const measurandIdNum = parseInt(measurandId);

    if (isNaN(terminalIdNum)) {
      logger.warn(`Invalid TerminalId format: ${terminalId}`);
      return res
        .status(400)
        .json({ message: `Invalid TerminalId format: ${terminalId}` });
    }
    if (isNaN(measurandIdNum)) {
      logger.warn(`Invalid MeasurandId format: ${measurandId}`);
      return res
        .status(400)
        .json({ message: `Invalid MeasurandId format: ${measurandId}` });
    }

    if (!from || !to) {
      logger.warn("Missing from or to date parameters");
      return res
        .status(400)
        .json({ message: "From and to dates are required" });
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      logger.warn(`Invalid date format: from=${from}, to=${to}`);
      return res
        .status(400)
        .json({ message: `Invalid date format: from=${from}, to=${to}` });
    }

    const plant = await ESPlant.findOne(
      { "TerminalList.TerminalId": terminalIdNum },
      { MeasurandList: 1 }
    ).lean();
    const measurand = plant?.MeasurandList.find(
      (m) => m.MeasurandId === measurandIdNum
    );

    const records = await HDNutsGraph.aggregate([
      {
        $match: {
          TerminalId: terminalIdNum,
          TimeStamp: { $gte: fromDate, $lte: toDate },
        },
      },
      { $sort: { TimeStamp: -1 } },
      { $unwind: "$MeasurandData" },
      { $match: { "MeasurandData.MeasurandId": measurandIdNum } },
      {
        $project: {
          MeasurandId: "$MeasurandData.MeasurandId",
          MeasurandName:
            measurand?.DisplayName || "$MeasurandData.MeasurandName",
          MeasurandValue: "$MeasurandData.MeasurandValue",
          TimeStamp: 1,
          _id: 0,
        },
      },
    ]).exec();

    if (!records.length) {
      logger.info(
        `No records found for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}, Date Range: ${from} to ${to}`
      );
      return res.status(200).json({
        message: `No records found for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}, Date Range: ${from} to ${to}`,
        count: 0,
        data: [],
      });
    }

    logger.info(
      `Fetched ${records.length} records for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}, Date Range: ${from} to ${to}`
    );
    res.status(200).json({
      message: `Fetched ${records.length} records for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandIdNum}, Date Range: ${from} to ${to}`,
      count: records.length,
      data: records,
    });
  } catch (error) {
    logger.error(`Error fetching records by date range: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

// GET /api/hdnuts/measurand-value?terminalId=6&measurandId=2&profile=block
exports.getMeasurandValue = async (req, res) => {
  try {
    const { terminalId, measurandId, profile } = req.query;
    if (!terminalId || !measurandId || !profile) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameters.' });
    }
    let Model;
    if (profile.toLowerCase() === 'block') {
      Model = HDNuts900;
    } else if (profile.toLowerCase() === 'trend') {
      Model = HDNutsGraph;
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid profile. Use block or trend.' });
    }
    const doc = await Model.findOne({ TerminalId: Number(terminalId) }).sort({ TimeStamp: -1 }).lean();
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'No data found for this terminal.' });
    }
    const meas = (doc.MeasurandData || []).find(m => m.MeasurandId === Number(measurandId));
    if (!meas) {
      return res.status(404).json({ status: 'error', message: 'Measurand not found.' });
    }
    res.status(200).json({
      status: 'success',
      data: {
        TerminalId: doc.TerminalId,
        TerminalName: doc.TerminalName,
        TimeStamp: doc.TimeStamp,
        MeasurandId: meas.MeasurandId,
        MeasurandName: meas.MeasurandName,
        MeasurandValue: meas.MeasurandValue,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = exports;
