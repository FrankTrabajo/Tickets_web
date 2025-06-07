// Importamos Express y configuramos un enrutador para manejar las rutas .
const express = require('express');
const router = express.Router();
//importamos los controladores del usuario
const {updateUser, deleteUser, getAllUsers, logoutUser, loginUser, registerUser, forgotPassword, resetPassword} = require('../controllers/user.controller.js');

// Definimos las rutas para poder realizar el CRUD de los posts

router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update-user/:id", updateUser);

router.get("/get_all_users", getAllUsers);

router.delete("/delete-user/:id", deleteUser);

router.post('/forgot-pass', forgotPassword);
router.post('/reset-pass/:token', resetPassword);


// Exportamos el router
module.exports = router;