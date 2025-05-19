const express = require('express');
const router = express.Router();
const upload = require("../middlewares/uploads.js");
const { newEvent, get_all_events_from_user, getEstadisticasUsuario, removeEvent, getEvento, updateEvent , getAllEvents, getEventByIdPublic} = require('../controllers/event.controller.js');

router.post("/new_event", upload.single('imagen'), newEvent);

router.get("/get_all_events_from_user", get_all_events_from_user);
router.get("/details/:id", upload.single('imagen'), getEvento);
router.get("/get_estadisticas_usuario", getEstadisticasUsuario);

router.put("/update/:id", upload.single('imagen'), updateEvent);

router.delete("/delete_event/:id", removeEvent);

router.get("/get_all_events", getAllEvents);
router.get("/get_event_by_id/:id", getEventByIdPublic);


module.exports = router;