const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const esTerminalSchema = new Schema(
  {
    _id: { type: Number },
    Terminalid: { type: Number, required: true },
    TerminalName: { type: String, required: true },
    Description: { type: String, required: true },
    DisplayName: { type: String, required: true },
    DeviceId: { type: Number, required: true },
    BridgeId: { type: Number, required: true },
    AggregaterId: { type: Number, required: true },

    DeviceDetails: [
      {
        DeviceParameter: { type: String, required: true },
        DeviceValue: { type: String, required: true },
      },
    ],

    BridgeDetails: [
      {
        BridgeParameter: { type: String, required: true },
        BridgeValue: { type: String, required: true },
      },
    ],

    AggregaterDetails: [
      {
        AggregaterParameter: { type: String, required: true },
        AggregaterValue: { type: String, required: true },
      },
    ],

    StapleList: [
      {
        StapleId: { type: Number, required: true },
        StapleName: { type: String, required: true },
        StapleValue: { type: String, required: true },
      },
    ],

    MeasurandList: [
      {
        _id: false,
        MeasurandId: { type: Number, required: true },
        MeasurandName: { type: String, required: true },
        DisplayName: { type: String, required: true },
        DisplayUnit: [
          {
            _id: false,
            Unit: { type: String, required: true },
            MF: { type: Number, required: true, default: 1 },
            C: { type: Number, required: true, default: 0 },
          },
        ],
      },
    ],

    ModQueryList: [
      {
        ModQueryId: { type: Number, required: true },
        ModQueryName: { type: String, required: true },
      },
    ],
  },
  { collection: "ESTerminal" },
  { timestamps: true }
);

module.exports = mongoose.model("ESTerminal", esTerminalSchema);
