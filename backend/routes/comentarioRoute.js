const express = require('express');
const router = express.Router();
const { crearComentario, getAllComments } = require ('../controllers/comentario.controller');
const { obtenerComentariosDelUsuario } = require ('../controllers/comentario.controller');

router.post('/new-comment', crearComentario);
router.get('/usuario', obtenerComentariosDelUsuario);

router.get("/get-all-comments", getAllComments);

module.exports = router;

