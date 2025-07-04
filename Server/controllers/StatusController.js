const ESBridge = require("../models/ESBridge");
const ESTerminal = require("../models/ESTerminal");
const ESComStat = require("../models/ESComStat");

exports.GetBridges = async (req, res) => {
  try {
    const esbridge = await ESBridge.find().select("_id BridgeName DisplayName");
    res.status(200).json(esbridge);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.GetTerminals = async (req, res) => {
  try {
    const esterminal = await ESTerminal.find().select(
      "_id TerminalId TerminalName DisplayName"
    );
    res.status(200).json(esterminal);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.GetComStats = async (req, res) => {
  try {
    const escomstat = await ESComStat.find();
    res.status(200).json(escomstat);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
