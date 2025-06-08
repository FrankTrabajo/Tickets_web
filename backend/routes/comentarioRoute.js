const express = require('express');
const router = express.Router();
const { crearComentario } = require ('../controllers/comentario.controller');
const { obtenerComentariosDelUsuario } = require ('../controllers/comentario.controller');

router.post('/', crearComentario);
router.get('/usuario', obtenerComentariosDelUsuario);

module.exports = router;

