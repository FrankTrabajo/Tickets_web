const Evento = require("../models/Evento");
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const Ticket = require("../models/Ticket.js");
const Comentario = require("../models/Comentario.js");
const { cloudinary } = require("../middlewares/cloudinary");


dotenv.config();

/**
 * Esta constante tiene configurado los pasos para crear un nuevo evento con los datos obtenido del formulario para crear un nuevo evento.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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


        let img = '';
        let img_public_id = '';
        if (!req.file) {
            const cloudinary = require('cloudinary').v2;
            img = cloudinary.url('banner_no_img_noqxax.png'); // sin carpeta "eventos"
            img_public_id = "banner_no_img_noqxax.png"; // igual, sin carpeta


        } else {
            img = req.file.path; // esta es la URL pública de Cloudinary
            img_public_id = req.file.filename;
        }



        const nuevoEvento = new Evento({
            nombre,
            descripcion,
            fecha,
            lugar,
            capacidad: parseInt(capacidad),
            imagen: img,
            imagen_id: img_public_id,
            entradas,
            creador: userId
        });

        await nuevoEvento.save();
        res.status(201).json({ mensaje: "Evento creado correctamente", evento: nuevoEvento, ok: true });
    } catch (e) {
        console.error("Error al crear evento:", e);
        res.status(500).json({ error: e.message || 'Error al guardar el evento', ok: false });
    }
};

/**
 * Tiene la configuración para poder actualizar un evento en especifico obteniendo el id del evento que se va amodificar por el parámetro id
 * y los datos a actualizar de ese evento desde el cuerpo de la llamada desde el script.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

        let imagenUrl = eventToUpdate.imagen;
        let imagenId = eventToUpdate.imagen_id;

        if (req.file) {
            if (imagenId) {
                await cloudinary.uploader.destroy(imagenId);
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "eventos"
            });

            imagenUrl = result.secure_url;
            imagenId = result.public_id;
        }

        // Actualizar campos
        eventToUpdate.nombre = nombre;
        eventToUpdate.descripcion = descripcion;
        eventToUpdate.fecha = fecha;
        eventToUpdate.capacidad = parseInt(capacidad);
        eventToUpdate.lugar = lugar;
        eventToUpdate.entradas = entradas;
        eventToUpdate.imagen = imagenUrl;
        eventToUpdate.imagen_id = imagenId;

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

/**
 * Se encarga de obtener un evento en especifico obteniendo ese id por parámetros.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

/**
 * Se encarga de eliminar un evento, obteniendo ese id por parámetro id.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const removeEvent = async (req, res) => {

    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: "No autorizado" });
    }

    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const eventoId = req.params.id; // Obtener el ID del evento de los parámetros de la URL

    // Verificar si el evento existe y pertenece al usuario
    const evento = await Evento.findById({ _id: eventoId });
    if (!evento) {
        return res.status(404).json({ message: "Evento no encontrado o no autorizado" });
    }

    if (evento.imagen_id && !evento.imagen.includes("banner_no_img")) {
        await cloudinary.uploader.destroy(evento.imagen_id);
    }

    await Ticket.deleteMany({ id_evento: eventoId });
    await Comentario.deleteMany({ id_evento: eventoId });

    // Eliminar el evento
    await Evento.deleteOne({ _id: eventoId });
    res.status(200).json({ message: "Evento eliminado correctamente", ok: true });


}


/**
 * Obtiene todos los eventos por usuario, buscando en la base de datos todos esos eventos creados por un usario en especifico.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

/**
 * Obtiene todas las estadisticas de un usuario, haciendo una evaluación y un cálculo entre las compras y los tickets vendidos cada uno de los eventos.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

/**
 * Obtiene todos los eventos creados.
 * @param {*} req 
 * @param {*} res 
 */
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