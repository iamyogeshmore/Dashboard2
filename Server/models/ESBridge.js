const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const esBridgeSchema = new Schema(
  {
    _id: Number,
    BridgeName: String,
    Description: String,
    DisplayName: String,
    DeviceId: String,
    AggregatorId: String,
    DeviceDetails: [
      {
        DeviceParameter: String,
        DeviceValue: String,
      },
    ],
    AggregatorDetails: [
      {
        AggregatorParameter: String,
        AggregatorValue: String,
      },
    ],
    StapleList: [
      {
        StapleId: Number,
        StapleName: String,
        StapleValue: String,
      },
    ],
  },
  { collection: "ESBridge" }
);

module.exports = mongoose.model("ESBridge", esBridgeSchema);
