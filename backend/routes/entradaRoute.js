const express = require('express');
const router = express.Router();
const {getEntradasUsuario} = require('../controllers/entrada.controller');

router.get('/', getEntradasUsuario);

module.exports = router;

