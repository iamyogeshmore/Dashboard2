const mongoose = require('mongoose');

const widgetTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'widgettemplates',
});

module.exports = mongoose.model('WidgetTemplate', widgetTemplateSchema); 