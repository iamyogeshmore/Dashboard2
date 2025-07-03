const mongoose = require('mongoose');

const terminalViewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  widgetType: { type: String, required: true },
  plant: { type: String, required: true },
  terminal: { type: String, required: true },
  measurands: [{ type: String, required: true }],
  layout: { type: Array, required: true },
  createdTime: { type: String, required: true },
}, {
  collection: 'TerminalCDDView',
  timestamps: true,
});

module.exports = mongoose.model('TerminalCDDView', terminalViewSchema); 