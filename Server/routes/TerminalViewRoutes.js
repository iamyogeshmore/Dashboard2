const express = require('express');
const router = express.Router();
const controller = require('../controllers/TerminalViewController');

router.post('/', controller.createView);
router.get('/', controller.getViews);
router.get('/:id', controller.getViewById);
router.delete('/:id', controller.deleteView);
router.put('/:id', controller.updateView);

module.exports = router; 