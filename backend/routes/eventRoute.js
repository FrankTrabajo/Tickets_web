const express = require('express');
const router = express.Router();

const { newEvent } = require('../controllers/event.controller.js');

router.post("/new_event", newEvent);

module.exports = router;