const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

// ----------------------- Route to get all queries -----------------------
router.get("/queries", logController.getQueries);

// ----------------------- Route to execute a query -----------------------
router.post("/execute-query", logController.executeQuery);

module.exports = router;
