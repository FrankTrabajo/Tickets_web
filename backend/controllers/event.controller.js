const Evento = require("../models/Evento");
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const Ticket = require("../models/Ticket");


dotenv.config();

const newEvent = async (req, res) => {
    try {
        // Parsear los campos que vienen como strings JSON
        const lugar = JSON.parse(req.body.lugar);
        const entradas = JSON.parse(req.body.entradas);

        const { nombre, descripcion, fecha, capacidad } = req.body;
        const token = req.cookies.authToken;

        if (!token) return res.status(401).json({ message: "No autorizado" });

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Validar capacidad vs entradas
        const totalEntradas = entradas.reduce((total, grupo) => total + parseInt(grupo.cantidad || 0), 0);
        if (totalEntradas > parseInt(capacidad)) {
            return res.status(400).json({ message: 'La capacidad total de entradas no puede superar la capacidad del evento' });
        }
        let img = ''
        // Ruta de la imagen
        if(!req.file) {
            img = '/img/eventos/banner_no_img.png';
        }else{
            img = req.file ? '/img/eventos/' + req.file.filename : null;
        }
        

        const nuevoEvento = new Evento({
            nombre,
            descripcion,
            fecha,
            lugar,
            capacidad: parseInt(capacidad),
            imagen: img,
            entradas,
            creador: userId
        });

        await nuevoEvento.save();
        res.status(201).json({ mensaje: "Evento creado correctamente", evento: nuevoEvento, ok: true });
    } catch (e) {
        console.error("Error al crear evento:", e);
        res.status(500).json({ error: e.message || 'Error al guardar el evento' , ok: false  });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { nombre, descripcion, fecha, capacidad } = req.body;

        const id = req.params.id;
        const lugar = JSON.parse(req.body.lugar);
        const entradas = JSON.parse(req.body.entradas);

        const token = req.cookies.authToken;
        if (!token) return res.status(401).json({ message: "No autorizado" });

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const eventToUpdate = await Evento.findById(id);
        if (!eventToUpdate) return res.status(404).json({ message: `Evento no encontrado ${id}` });

        // Validar capacidad vs entradas
        const totalEntradas = entradas.reduce((total, grupo) => total + parseInt(grupo.cantidad || 0), 0);
        if (totalEntradas > parseInt(capacidad)) {
            return res.status(400).json({
                message: 'La cantidad total de entradas no puede superar la capacidad del evento'
            });
        }

        // Ruta de la imagen si se subió una nueva
        const imagenPath = req.file ? '/img/eventos/' + req.file.filename : eventToUpdate.imagen;

        // Actualizar campos
        eventToUpdate.nombre = nombre;
        eventToUpdate.descripcion = descripcion;
        eventToUpdate.fecha = fecha;
        eventToUpdate.capacidad = parseInt(capacidad);
        eventToUpdate.imagen = imagenPath;
        eventToUpdate.entradas = entradas;
        eventToUpdate.lugar = lugar;

        await eventToUpdate.save();

        res.status(200).json({
            mensaje: "Evento actualizado correctamente",
            evento: eventToUpdate,
            ok: true
        });
    } catch (e) {
        console.error("Error al actualizar evento:", e);
        res.status(500).json({ error: e.message || 'Error al guardar el evento' });
    }
};


const getEvento = async (req, res) => {
    try {
        const eventoId = req.params.id;

        const evento = await Evento.findOne({ _id: eventoId });
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        res.status(200).json({ evento });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el evento" });
    }
}

const removeEvent = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const eventoId = req.params.id; // Obtener el ID del evento de los parámetros de la URL

        // Verificar si el evento existe y pertenece al usuario
        const evento = await Evento.findOne({ _id: eventoId, creador: userId });
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado o no autorizado" });
        }
        // Eliminar el evento
        await Evento.deleteOne({ _id: eventoId });
        res.status(200).json({ message: "Evento eliminado correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el evento" });
    }
}



const get_all_events_from_user = async (req, res) => {
    try {
        //Los datos de los usuarios se obtienen de la cookie authToken
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: "No autorizado" });
        }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        //Aqui debemos obtener los eventos del usuario

        const eventos = await Evento.find({ creador: userId });
        if (!eventos) {
            return res.status(404).json({ message: "No se encontraron eventos" });
        }
        res.status(200).json({ eventos });
    } catch (error) {
        console.log("ERROR: Error al obtener los eventos del usuario", error);
        res.status(500).json({ message: error.message });
    }
}

const getEstadisticasUsuario = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: "No autorizado" });
        }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Oobtener los eventos creados del usuario
        const eventos = await Evento.find({ creador: userId });
        const eventoIds = eventos.map(evento => evento._id);

        if (eventoIds.length === 0) {
            return res.status(200).json({ totalEventos: 0, totalEntradasVendidas: 0, totalIngresos: 0 });
        }

        // Obtener las entradas vendidas de los eventos del usuario
        const ticketsVendidos = await Ticket.find({ id_evento: { $in: eventoIds }, estado: 'vendido' });

        const ingresos = ticketsVendidos.reduce((total, ticket) => total + parseFloat(ticket.precio), 0);

        res.status(200).json({ totalEventos: eventoIds.length, totalEntradasVendidas: ticketsVendidos.length, totalIngresos: ingresos, ticketsVendidos });
    } catch (error) {
        console.error("ERROR: Error al obtener las estadísticas del usuario", error);
        res.status(500).json({ message: error.message });
    }
}

const getAllEvents = async (req, res) => {
  try {
    const eventos = await Evento.find({});
    res.status(200).json(eventos);
  } catch (error) {
    console.error("Error al obtener todos los eventos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const getEventByIdPublic = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.status(200).json(evento);
  } catch (error) {
    console.error("Error al obtener evento por id:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


module.exports = {
    newEvent,
    updateEvent,
    getEvento,
    get_all_events_from_user,
    getEstadisticasUsuario,
    removeEvent, 
    getAllEvents,
    getEventByIdPublic
}