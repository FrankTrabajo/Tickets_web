const nodemailer = require('nodemailer');

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
  from: 'pruebasrubyfrank@gmail.com',
  to: 'frangargo.trabajo@gmail.com',
  subject: 'Asunto del correo',
  text: 'Este es el contenido del correo'
};

// Envía el correo
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('Error al enviar correo:', error);
  }
  console.log('Correo enviado:', info.response);
});
