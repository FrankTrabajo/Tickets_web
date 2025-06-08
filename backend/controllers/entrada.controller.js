const Ticket = require('../models/Ticket.js');
const jsonwebtoken = require('jsonwebtoken');

const getEntradasUsuario = async(req, res) => {
    try {
        const token = req.cookies.authToken;
        if(!token){
            res.status(401).json({message: "No autorizado"});
            return;
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;

        const entradas = await Ticket.find({id_usuario: id_usuario})
        .populate('id_evento')
        .lean();

        
        if (!Array.isArray(entradas)) {
            console.error("La respuesta de Ticket.find no es un array:", entradas);
            return res.status(500).json({ message: "Error interno: entradas no son un array" });
        }
        
        const resultado = entradas.map(ticket =>{
             const evento = ticket.id_evento || {};
            const lugar = evento.lugar || {};

            return {
                id_evento: evento._id,
                codigo: ticket.codigo,
                evento: evento.nombre,
                lugar: lugar.nombre,
                fecha: evento.fecha,
                precio: parseFloat(ticket.precio)
            };
        });

        res.json(resultado);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las entradas'});
    }
};

module.exports = {
    getEntradasUsuario
};

