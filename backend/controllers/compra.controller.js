const Evento = require("../models/Evento.js");
const Ticket = require("../models/Ticket.js");
const Pago = require("../models/Pago.js");
const Pedido = require("../models/Pedido.js");
const PedidoTicket = require("../models/PedidoTicket.js");
const jsonwebtoken = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const pdf = require('pdfkit')
const nodemailer = require('nodemailer');

const compra = async (req,res) => {
    try {
        const { idEvento, tipoEntrada, cantidad, metodoPago } = req.body;


        const token = req.cookies.authToken;

        if (!token) return res.status(401).json({ message: "No autorizado" });
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;
        const email_uduario = decoded.email;

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

        //Cambiamos el estado del pedido
        // Una vez se crea el pago se le cambia el estado del pedido a pagado
        pedido.estado = 'pagado';
        await pedido.save();

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


        // Vamos a generar los pdf con los QR de cada entrada
        const documento = new pdf();
        let buffers = [];
        documento.on('data', buffers.push.bind(buffers));
        documento.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            // Aqui generaremos el envío de email al usuario con las entradas
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_APP_ACCOUNT,
                    pass: process.env.GMAIL_APP_PASS
                }
            });

            const mailOptions = {
                from: 'tickelyticketsweb@gmail.com',
                to: email_uduario,
                subject: "Tus entradas",
                text: "Adjuntamos tus entradas en PDF. Gracias por su compra",
                attachments: [
                    {
                        filename: "entradas.pdf",
                        content: pdfData
                    }
                ]
            };

            // Envio del correo
            transporter.sendMail(mailOptions, (error, info) => {
                if(error){
                    console.error("Ha habido un error al enviar el correo", error);
                } else {
                    console.log("Correo enviado");
                }
            });
        });

        //Escribir datos en PDF
        documento.fontSize(18).text('Tus entradas', { align: 'center' });
        documento.moveDown();
        for (const ticket of tickets) {
            documento.fontSize(12).text(`Evento: ${evento.nombre}`);
            documento.text(`Zona: ${zona.tipo}`);
            documento.text(`Precio: ${ticket.precio} €`);
            documento.text(`Código: ${ticket.codigo}`);
            // Generar QR y añadirlo al PDF
            const qrDataUrl = await QRCode.toDataURL(ticket.codigo);
            const qrImage = qrDataUrl.replace(/^data:image\/png;base64,/, "");
            documento.image(Buffer.from(qrImage, 'base64'), { width: 100 });
            documento.moveDown();
        }
        documento.end();

        

        res.status(201).json({ mensaje: "Compra completada con éxito.", pedido, tickets, ok: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el proceso de compra" });
    }
}

module.exports = {
    compra
}