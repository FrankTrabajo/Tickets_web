const Evento = require("../models/Evento.js");
const Ticket = require("../models/Ticket.js");
const Pago = require("../models/Pago.js");
const Pedido = require("../models/Pedido.js");
const PedidoTicket = require("../models/PedidoTicket.js");
const jsonwebtoken = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const send_mail = (req,res) => {


    const token = req.cookies.authToken;
    
    if (!token) return res.status(401).json({ message: "No autorizado" });
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const email_usuario = decoded.email;

    // Crea un transporter con configuración para Gmail
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pruebasrubyfrank@gmail.com',         // Tu dirección de correo
        pass: 'exzs lasa xsjk snam' // Tu contraseña o app password
    }
    });

    // Define el contenido del correo
    const mailOptions = {
    from: 'tickelyticketsWeb@gmail.com',
    to: 'email_usuario',
    subject: 'Entradas',
    text: 'La compra ha sido'
    };

    // Envía el correo
    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.error('Error al enviar correo:', error);
    }
    console.log('Correo enviado:', info.response);
    });
}
