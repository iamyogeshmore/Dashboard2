const Dashboard = require("../models/Dashboard");

// Create
exports.createDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.create(req.body);
    res.status(201).json({ status: "success", data: dashboard });
  } catch (err) {
    next(err);
  }
};

// Get all
exports.getAllDashboards = async (req, res, next) => {
  try {
    const dashboards = await Dashboard.find();
    res.json({ status: "success", data: dashboards });
  } catch (err) {
    next(err);
  }
};

// Get by ID
exports.getDashboardById = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id);
    if (!dashboard)
      return res
        .status(404)
        .json({ status: "error", message: "Dashboard not found" });
    res.json({ status: "success", data: dashboard });
  } catch (err) {
    next(err);
  }
};

// Update
exports.updateDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!dashboard)
      return res
        .status(404)
        .json({ status: "error", message: "Dashboard not found" });
    res.json({ status: "success", data: dashboard });
  } catch (err) {
    next(err);
  }
};

// Delete
exports.deleteDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findByIdAndDelete(req.params.id);
    if (!dashboard)
      return res
        .status(404)
        .json({ status: "error", message: "Dashboard not found" });
    res.json({ status: "success", message: "Dashboard deleted" });
  } catch (err) {
    next(err);
  }
};

// Publish
exports.publishDashboard = async (req, res, next) => {
  try {
    // Unpublish all dashboards
    await Dashboard.updateMany({}, { isPublished: false });
    // Publish the selected dashboard
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );
    if (!dashboard)
      return res
        .status(404)
        .json({ status: "error", message: "Dashboard not found" });
    res.json({ status: "success", data: dashboard });
  } catch (err) {
    next(err);
  }
};

exports.listDashboards = async (req, res, next) => {
  try {
    const dashboards = await Dashboard.find({}, { name: 1, isPublished: 1 });
    res.json({ status: "success", data: dashboards });
  } catch (err) {
    next(err);
  }
};
