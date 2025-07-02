const express = require('express');
const router = express.Router();
const controller = require('../controllers/ESHistoricalTableController');

router.post('/', controller.createTable);
router.get('/', controller.getTables);
router.delete('/:id', controller.deleteTable);
router.get('/:id', controller.getTableById);

module.exports = router; 