const mongoose = require("mongoose");
const { Schema } = mongoose;

const MeasurandSchema = new Schema(
  {
    MeasurandId: Number,
    MeasurandName: String,
    MeasurandValue: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const HDNutsGraphSchema = new Schema(
  {
    TerminalId: Number,
    TerminalName: String,
    TimeStamp: Date,
    TimeStampId: mongoose.Schema.Types.Mixed,
    DebugLogTime: String,
    MeasurandData: [MeasurandSchema],
    DocNo: Number,
  },
  {
    collection: "HDNutsGraph",
    versionKey: false,
  }
);

module.exports = mongoose.model("HDNutsGraph", HDNutsGraphSchema);
