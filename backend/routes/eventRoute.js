const express = require('express');
const router = express.Router();
const upload = require("../middlewares/uploads.js");
const { newEvent, get_all_events_from_user, getEstadisticasUsuario, removeEvent, getEvento } = require('../controllers/event.controller.js');

router.post("/new_event", upload.single('imagen'), newEvent);

router.get("/get_all_events_from_user", get_all_events_from_user);
router.get("/details/:id", upload.single('imagen'), getEvento);
router.get("/get_estadisticas_usuario", getEstadisticasUsuario);

router.delete("/delete_event/:id", removeEvent);

module.exports = router;