const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");

router.post("/", DashboardController.createDashboard);
router.get("/", DashboardController.getAllDashboards);
router.get("/list", DashboardController.listDashboards); // Moved before /:id
router.get("/:id", DashboardController.getDashboardById);
router.put("/:id", DashboardController.updateDashboard);
router.delete("/:id", DashboardController.deleteDashboard);
router.put("/:id/publish", DashboardController.publishDashboard);

module.exports = router;
