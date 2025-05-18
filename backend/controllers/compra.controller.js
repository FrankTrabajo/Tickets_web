const Evento = require("../models/Evento.js");
const Ticket = require("../models/Ticket.js");
const Pago = require("../models/Pago.js");
const Pedido = require("../models/Pedido.js");
const PedidoTicket = require("../models/PedidoTicket.js");
const jsonwebtoken = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

const compra = async (req,res) => {
    try {
        const { idEvento, tipoEntrada, cantidad, metodoPago } = req.body;


        const token = req.cookies.authToken;

        if (!token) return res.status(401).json({ message: "No autorizado" });
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;

        if(cantidad < 1 || cantidad > 6){
            return res.status(400).json({ error: "La cantidad debe estar entre 1 y 6 entradas." });
        }

        // Buscamos el evento de la compra en cuesitión
        const evento = await Evento.findById(idEvento);
        if(!evento){
            return res.status(400).json({ error: "No se encontró el evento" });
        }

        // Comprobamos el metodo de pago
        if (metodoPago !== 'tarjeta') {
            return res.status(400).json({ error: "Método de pago no soportado." });
        }

        // Buscamos la zona de la entrada
        const zona = evento.entradas.find(e => e.tipo === tipoEntrada);
        if(!zona || zona.cantidad < cantidad){
            // Aqui lo que le decimos es, si no encuentra la zona seleccionada o la cantidad es mayor a la cantidad de entradas
                // que hay disponibles en la zona, da error
            return res.status(400).json({ error: "Error, entradas no disponibles" });
        }

        // Calculamos el total del pedido
        const total = parseFloat(zona.precio) * cantidad;

        // Creamos el pedido
        const pedido = await Pedido.create({
            id_usuario,
            total,
            estado: 'pendiente'
        });

        //  Creamos el ticket
        const tickets = [];

        for(let i = 0 ; i < cantidad; i++){
            // Aqui creamos un código único para cada ticket
            const codigo = uuidv4();
            const ticket = await Ticket.create({
                id_evento: evento._id,
                id_usuario,
                precio: zona.precio,
                estado: 'vendido',
                codigo,
                fecha_compra: new Date()
            });

            await PedidoTicket.create({
                id_pedido: pedido._id,
                id_ticket: ticket._id
            });

            tickets.push(ticket);
        }

        // Ahora tenemos que actualizar la cantidad de entradas disponibles del evento
        zona.cantidad -= cantidad;
        await evento.save();

        // Ahora creamos el pago para guardarlo en la base de datos
        const pago = await Pago.create({
            id_pedido: pedido._id,
            metodo_pago: metodoPago,
            estado: 'completado',
            fecha_pago: new Date()
        });

        //Cambiamos el estado del pedido
        // Una vez se crea el pago se le cambia el estado del pedido a pagado
        pedido.estado = 'pagado';
        await pedido.save();

        res.status(201).json({ mensaje: "Compra completada con éxito.", pedido, tickets });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el proceso de compra" });
    }
}

module.exports = {
    compra
}