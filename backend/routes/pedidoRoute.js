const express = require('express');
const router = express.Router();
const { getPedidoUsuario } = require('../controllers/pedido.controller');

router.get('/', getPedidoUsuario);

module.exports = router;


