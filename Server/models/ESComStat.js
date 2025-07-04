const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const esComStatSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    BridgeId: { type: Number, required: true },
    BridgeName: { type: String, required: true },
    Status: { type: Boolean, required: true },
    TerminalDetails: [
      {
        _id: false,
        TerminalId: { type: Number, required: true },
        TerminalName: { type: String, required: true },
        Status: { type: Boolean, required: true },
      },
    ],
  },
  { collection: "ESComStat" }
);

module.exports = mongoose.model("ESComStat", esComStatSchema);
