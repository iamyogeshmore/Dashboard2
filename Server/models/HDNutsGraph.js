const mongoose = require("mongoose");
const { Schema } = mongoose;

const MeasurandSchema = new Schema(
  {
    MeasurandId: Number,
    MeasurandName: String,
    MeasurandValue: Number,
  },
  { _id: false }
);

const HDNutsGraphSchema = new Schema(
  {
    TerminalId: Number,
    TerminalName: String,
    TimeStamp: Date,
    TimeStampId: Number,
    MeasurandData: [MeasurandSchema],
    DocNo: Number,
  },
  {
    collection: "HDNutsGraph",
    timestamps: false,
  }
);

module.exports = mongoose.model("HDNutsGraph", HDNutsGraphSchema);
