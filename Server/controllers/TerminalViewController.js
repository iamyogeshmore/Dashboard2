const TerminalView = require('../models/TerminalCDDView');
const { v4: uuidv4 } = require('uuid');

exports.createView = async (req, res) => {
  try {
    let { id, name, widgetType, plant, terminal, measurands, layout, createdTime } = req.body;
    if (!id) id = uuidv4();
    if (!name || !widgetType || !plant || !terminal || !measurands || !layout || !createdTime) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }
    const view = new TerminalView({ id, name, widgetType, plant, terminal, measurands, layout, createdTime });
    await view.save();
    res.status(201).json({ status: 'success', data: view });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getViews = async (req, res) => {
  try {
    const views = await TerminalView.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ status: 'success', data: views });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getViewById = async (req, res) => {
  try {
    const { id } = req.params;
    const view = await TerminalView.findById(id).lean();
    if (!view) {
      return res.status(404).json({ status: 'error', message: 'View not found.' });
    }
    res.status(200).json({ status: 'success', data: view });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.deleteView = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TerminalView.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'View not found.' });
    }
    res.status(200).json({ status: 'success', message: 'View deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateView = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await TerminalView.findOneAndUpdate({ id }, update, { new: true });
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'View not found.' });
    }
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}; 