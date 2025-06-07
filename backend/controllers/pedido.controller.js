const Pedido = require('../models/Pedido.js');
const Ticket = require ('../models/Ticket.js');
const PedidoTicket = require('../models/PedidoTicket.js');
const jsonwebtoken = require ('jsonwebtoken');

const getPedidoUsuario = async(req, res)=>{
    try {
        const token = req.cookies.authToken;
        if (!token) {
        res.status(401).json({ message: "No autorizado" });
        return;
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;

        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaLimite.getMonth() - 1);

        const pedidos = await Pedido.find({
            id_usuario: id_usuario,
            fecha_pedido: {$gte: fechaLimite}
        })
        .sort({fecha_pedido: -1}).lean();

        const resultado = [];

        for(let i=0; i < pedidos.length; i++){
            const pedido = pedidos[i];
            
            const ticketsPedido = await PedidoTicket.find({
                id_pedido: pedido._id
            }).lean();

            const idTickets = ticketsPedido.map(ticketPedido => ticketPedido.id_ticket);

           const tickets = await Ticket.find({
                _id: { $in: idTickets },
                id_usuario: id_usuario,
            })
            .populate('id_evento')
            .lean();

                 const items = tickets.map(ticket => {
                let nombreEvento = 'Evento no disponible';
                let fechaEvento = 'Fecha no disponible';

                if (ticket.id_evento && ticket.id_evento.nombre) {
                    nombreEvento = ticket.id_evento.nombre;
                }

                if (ticket.id_evento && ticket.id_evento.fecha) {
                    fechaEvento = ticket.id_evento.fecha;
                }

                return {
                    evento: nombreEvento,
                    fecha: fechaEvento,
                    precio: parseFloat(ticket.precio)
                };
            });

            resultado.push({
                id: pedido._id,
                fecha: pedido.fecha_pedido,
                total: parseFloat(pedido.total),
                items: items
            });
        }

        res.json(resultado);
    } catch (error) {
        console.error("Error en getPedidoUsuario:", error); 
        res.status(500).json({message: 'Error al obtener pedidos'});
    }
};

module.exports = {getPedidoUsuario};


