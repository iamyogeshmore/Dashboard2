const mongoose = require("mongoose");

const MeasurandDetailSchema = new mongoose.Schema(
  {
    MeasurandId: Number,
    MeasurandName: String,
    MeasurandValue: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const ESPlantTerminalSchema = new mongoose.Schema(
  {
    PlantId: Number,
    PlantName: String,
    TerminalId: Number,
    TerminalName: String,
    TimeStamp: Date,
    TimeStampId: mongoose.Schema.Types.Mixed,
    MeasurandData: {
      type: Map,
      of: MeasurandDetailSchema,
    },
  },
  {
    collection: "ESPlantTerminal",
    versionKey: false,
  }
);

ESPlantTerminalSchema.pre("save", function (next) {
  next(new Error("ESPlantTerminal is read-only"));
});

module.exports = mongoose.model("ESPlantTerminal", ESPlantTerminalSchema);
