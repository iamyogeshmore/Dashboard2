const mongoose = require('mongoose');

const MeasurandSchema = new mongoose.Schema({
  MeasurandId: Number,
  MeasurandName: String,
  MeasurandValue: mongoose.Schema.Types.Mixed,
}, { _id: false });

const HDNuts900Schema = new mongoose.Schema({
  TerminalId: Number,
  TerminalName: String,
  TimeStamp: Date,
  TimeStampId: mongoose.Schema.Types.Mixed,
  DebugLogTime: String,
  MeasurandData: [MeasurandSchema],
}, {
  collection: 'HDNuts900',
  versionKey: false,
});

module.exports = mongoose.model('HDNuts900', HDNuts900Schema); 