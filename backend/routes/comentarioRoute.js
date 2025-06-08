const express = require('express');
const router = express.Router();
const { crearComentario } = require ('../controllers/comentario.controller');

router.post('/', crearComentario);

module.exports = router;

