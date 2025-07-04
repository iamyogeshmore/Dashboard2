const express = require("express");
const router = express.Router();
const statusController = require("../controllers/StatusController");

router.get("/get-bridges", statusController.GetBridges);
router.get("/get-terminals", statusController.GetTerminals);
router.get("/get-escomstat", statusController.GetComStats);

module.exports = router;
