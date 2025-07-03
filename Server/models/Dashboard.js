const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema(
  {
      
    name: { type: String, required: true },
    patron: { type: String },
    widgets: { type: Array, default: [] },
    layout: { type: Array, default: [] },
    isPublished: { type: Boolean, default: false },
  },
  {
    collection: "Dashboard",
    timestamps: true,
  }
);

module.exports = mongoose.model("Dashboard", DashboardSchema);
