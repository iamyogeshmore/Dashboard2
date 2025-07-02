const ESHistoricalTable = require("../models/ESHistoricalTable");
const ESPlant = require("../models/ESPlant");

exports.createTable = async (req, res) => {
  try {
    const { name, profile, plantId, terminalId, measurandIds } = req.body;
    if (
      !name ||
      !profile ||
      !plantId ||
      !terminalId ||
      !measurandIds ||
      !Array.isArray(measurandIds)
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields." });
    }
    const table = new ESHistoricalTable({
      name,
      profile,
      plantId,
      terminalId,
      measurandIds,
    });
    await table.save();
    res.status(201).json({ status: "success", data: table });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await ESHistoricalTable.find()
      .sort({ createdAt: -1 })
      .lean();
    // Populate display names for plant, terminal, and measurand
    const plantIds = [...new Set(tables.map((t) => t.plantId))];
    const plants = await ESPlant.find({ _id: { $in: plantIds } }).lean();
    const plantMap = {};
    plants.forEach((plant) => {
      plantMap[plant._id] = plant;
    });
    const result = tables.map((table) => {
      const plant = plantMap[table.plantId];
      let plantDisplayName = plant ? plant.DisplayName : table.plantId;
      let terminalDisplayName = table.terminalId;
      let measurandDisplayNames = table.measurandIds;
      if (plant) {
        const terminal = (plant.TerminalList || []).find(
          (t) => t.TerminalId === table.terminalId
        );
        terminalDisplayName = terminal
          ? terminal.DisplayName || terminal.TerminalName
          : table.terminalId;
        measurandDisplayNames = (table.measurandIds || []).map((mid) => {
          const m = (plant.MeasurandList || []).find(
            (meas) => meas.MeasurandId === mid
          );
          return m ? m.DisplayName || m.MeasurandName : mid;
        });
      }
      // Format createdAt as a readable string
      let createdTime = table.createdAt
        ? new Date(table.createdAt).toLocaleString()
        : "";
      return {
        ...table,
        plantDisplayName,
        terminalDisplayName,
        measurandDisplayNames,
        createdTime,
      };
    });
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Delete a table by id
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ESHistoricalTable.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Table not found." });
    }
    res.status(200).json({ status: "success", message: "Table deleted." });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await ESHistoricalTable.findById(id).lean();
    if (!table) {
      return res.status(404).json({ status: 'error', message: 'Table not found.' });
    }
    // Populate display names for plant, terminal, and measurand
    const plant = await ESPlant.findById(table.plantId).lean();
    let plantDisplayName = plant ? plant.DisplayName : table.plantId;
    let terminalDisplayName = table.terminalId;
    let measurandDisplayNames = table.measurandIds;
    if (plant) {
      const terminal = (plant.TerminalList || []).find(t => t.TerminalId === table.terminalId);
      terminalDisplayName = terminal ? (terminal.DisplayName || terminal.TerminalName) : table.terminalId;
      measurandDisplayNames = (table.measurandIds || []).map(mid => {
        const m = (plant.MeasurandList || []).find(meas => meas.MeasurandId === mid);
        return m ? (m.DisplayName || m.MeasurandName) : mid;
      });
    }
    let createdTime = table.createdAt ? new Date(table.createdAt).toLocaleString() : "";
    res.status(200).json({
      status: 'success',
      data: {
        ...table,
        plantDisplayName,
        terminalDisplayName,
        measurandDisplayNames,
        createdTime,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
