const Evento = require("../models/Evento");
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const Ticket = require("../models/Ticket");


dotenv.config();

const newEvent = async (req,res) => {

    try{
        const { nombre, descripcion, fecha, lugar, capacidad, imagen, entradas } = req.body;

        const token = req.cookies.authToken;
            if (!token) {
              return res.status(401).json({ message: "No autorizado" });
            }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;


        const nuevoEvento = new Evento({
            nombre,
            descripcion,
            fecha,
            lugar,
            capacidad,
            imagen,
            entradas,
            creador: userId
        });

        await nuevoEvento.save();
        res.status(201).json({ mensaje: "Evento creado correctamente", evento: nuevoEvento});
    }catch(e){
        console.error("ERROR: Ha habido un error al crear el nuevo evento:", e);
        res.status(500).json({ error: 'Hubo un problema al guardar el evento' });
    }

};

const removeEvent = async (req,res) => {
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

const updateEvent = async (req,res) => {
    
}



const get_all_events_from_user = async (req, res) => {
    try{
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
        res.status(200).json({eventos});
    }catch(error){
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

        if(eventoIds.length === 0){
            return res.status(200).json({ totalEventos: 0, totalEntradasVendidas: 0, totalIngresos: 0 });
        }

        // Obtener las entradas vendidas de los eventos del usuario
        const ticketsVendidos = await Ticket.find({ id_evento: { $in: eventoIds }, estado: 'vendido' });

        const ingresos = ticketsVendidos.reduce((total, ticket) => total + parseFloat(ticket.precio), 0);

        res.status(200).json({ totalEventos: eventoIds.length, totalEntradasVendidas: ticketsVendidos.length, totalIngresos: ingresos });
    } catch (error) {
        console.error("ERROR: Error al obtener las estadísticas del usuario", error);
        res.status(500).json({ message: error.message });
    }
}
   

module.exports = {
    newEvent,
    get_all_events_from_user,
    getEstadisticasUsuario,
    removeEvent
}