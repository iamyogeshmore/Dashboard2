const WidgetTemplate = require('../models/widgetTemplate');

// Create a new widget template
exports.createTemplate = async (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ status: 'error', message: 'Name and data are required.' });
    }
    const template = new WidgetTemplate({ name, data });
    await template.save();
    res.status(201).json({ status: 'success', data: template });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get all widget templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await WidgetTemplate.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ status: 'success', data: templates });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get a widget template by id
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await WidgetTemplate.findById(id).lean();
    if (!template) {
      return res.status(404).json({ status: 'error', message: 'Template not found.' });
    }
    res.status(200).json({ status: 'success', data: template });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Update a widget template by id
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, data } = req.body;
    const updated = await WidgetTemplate.findByIdAndUpdate(
      id,
      { name, data },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Template not found.' });
    }
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Delete a widget template by id
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WidgetTemplate.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Template not found.' });
    }
    res.status(200).json({ status: 'success', message: 'Template deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}; 