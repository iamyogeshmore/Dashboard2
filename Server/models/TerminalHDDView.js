const mongoose = require('mongoose');

const esHistoricalTableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profile: { type: String, required: true },
  plantId: { type: Number, required: true },
  terminalId: { type: Number, required: true },
  measurandIds: [{ type: Number, required: true }],
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'TerminalHDDView',
});

module.exports = mongoose.model('TerminalHDDView', esHistoricalTableSchema); 