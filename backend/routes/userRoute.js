// Importamos Express y configuramos un enrutador para manejar las rutas .
const express = require('express');
const router = express.Router();
//importamos los controladores del usuario
const {logoutUser, loginUser, registerUser} = require('../controllers/user.controller.js');

// Definimos las rutas para poder realizar el CRUD de los posts

router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);


// Exportamos el router
module.exports = router;