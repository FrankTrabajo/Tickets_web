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

        const resultado = entradas.map(ticket =>({
            codigo: ticket.codigo,
            evento: ticket.id_evento.nombre,
            lugar: ticket.id_evento.lugar.nombre,
            fecha: ticket.id_evento.fecha,
            precio: parseFloat(ticket.precio)
        }));

        res.json(resultado);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las entradas'});
    }
};

module.exports = {
    getEntradasUsuario
};