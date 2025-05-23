const express = require('express');
const router = express.Router();
const { compra } = require('../controllers/compra.controller.js');

router.post("/nueva_compra", compra);

module.exports = router;