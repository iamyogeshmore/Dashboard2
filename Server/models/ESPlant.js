const mongoose = require("mongoose");

const terminalSchema = new mongoose.Schema({
  TerminalId: { type: Number, required: true },
  TerminalName: { type: String, required: true },
  DisplayName: { type: String, required: true },
});

const measurandSchema = new mongoose.Schema({
  MeasurandId: { type: Number, required: true },
  MeasurandName: { type: String, required: true },
  Unit: { type: String, required: true },
  DisplayName: { type: String, required: true },
});

const plantSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true },
    PlantName: { type: String, required: true },
    Description: { type: String, required: true },
    DisplayName: { type: String, required: true },
    Type: { type: String, required: true },
    TerminalList: [terminalSchema],
    MeasurandList: [measurandSchema],
    QueryList: [{ type: String }],
    ScriptList: [{ type: String }],
  },
  {
    collection: "ESPlant",
  }
);

module.exports = mongoose.model("ESPlant", plantSchema);
