const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');

dotenv.config();

//* ----------- AQUI HAY USUARIOS CLIENTES Y ADMINISTRADORES DE EVENTOS -------------


//* ---- LOGIN -----
const User = require('../models/User.js');
const Evento = require('../models/Evento.js');
const Comentario = require('../models/Comentario.js');
const Pedido = require('../models/Pedido.js');
const Pago = require('../models/Pago.js');
const Ticket = require('../models/Ticket.js');
const PedidoTicket = require('../models/PedidoTicket.js');

/**
 * Esta función es la encargada del inicio de sesión, creando el token con la infromación del usuario y almacenándolo en las cookies.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const passOk = await user.comparePassword(password);
        if (!passOk) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jsonwebtoken.sign({ userId: user._id.toString(), email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('authToken', token, { httpOnly: true, secure: false, maxAge: 3600000 });

        res.status(200).json({ message: "Login correcto", user });

    } catch (error) {
        console.log("Error en el login", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};


/**
 * Esta conectante se encara de cerrar la sesión del usuario.
 * @param {*} req 
 * @param {*} res 
 */
const logoutUser = async (req, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        res.json({ message: "Sesión cerrada" });
    } catch (error) {
        res.status(500).json({ message: "ERROR: Hubo un error al cerrar sesión" });
    }
};

/**
 * Esta constante es la encargada de crear nuevos usuarios y almacenarlos en la base de datos obteniendo los valores desde el formulario de registro.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const registerUser = async (req, res) => {
    try {
        const { nombre, email, password1, password2 } = req.body;

        if (!nombre || !email || !password1 || !password2) {
            return res.status(400).json({ message: "Todos los campos son obligatorios", ok: false });
        }

        if (password1 !== password2) {
            return res.status(400).json({ message: "Las contraseñas no coinciden", ok: false });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El email ya está registrado", ok: false });
        }

        const newUser = new User({
            nombre,
            email,
            password: password1
        });

        await newUser.save();

        const { password, ...userData } = newUser.toObject();

        res.status(201).json({userData, ok: true});

    } catch (error) {
        console.log("ERROR: Error en el registro", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "El email ya está registrado", ok: false });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtengo todos los usuarios de la base de datos.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        return res.status(201).json({ users });
    } catch (error) {
        console.error("ERROR: No se pudo obtener los usuarios");
        return res.status(500).json({ message: "Error, no se pudo obtener los usuarios" });
    }
}

/**
 * Es el encargado de eliminar un usuario en especifico.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteUser = async (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: "No autorizado", ok: false });
    }

    
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const rolAuth = decoded.rol;

        if (!rolAuth.includes("SUPER_ADMIN")) {
            return res.status(403).json({ message: "Acceso denegado", ok: false });
        }

        const userId = req.params.id;

        // 1. Buscar al usuario que se quiere eliminar
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado", ok: false });
        }

        const isAdmin = user.rol === "ADMIN";

        if (isAdmin) {
            // Si es admin, elimina sus eventos y todo lo relacionado
            const eventos = await Evento.find({ creador: userId });
            const eventoIds = eventos.map(evento => evento._id);

            await Comentario.deleteMany({ id_evento: { $in: eventoIds } });
            await Ticket.deleteMany({ id_evento: { $in: eventoIds } });
            await Evento.deleteMany({ creador: userId });
        } else {
            // Si es usuario común, elimina sus compras, tickets y comentarios
            const pedidos = await Pedido.find({ id_usuario: userId });
            const pedidoIds = pedidos.map(p => p._id);

            await Comentario.deleteMany({ id_usuario: userId });
            await Ticket.deleteMany({ id_usuario: userId });
            await PedidoTicket.deleteMany({ id_pedido: { $in: pedidoIds } });
            await Pago.deleteMany({ id_pedido: { $in: pedidoIds } });
            await Pedido.deleteMany({ id_usuario: userId });
        }

        // Finalmente, eliminar el usuario
        await User.findByIdAndDelete(userId);

        console.log("USUARIO Y RELACIONES ELIMINADAS");
        return res.status(200).json({ message: "Usuario y sus datos eliminados correctamente", ok: true });

};


/**
 * Se encarga de actualizar a un usuario en especifico con los valores pasado por el cuerpo enviado desde el JavaScript.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateUser = async (req,res) => {
    try {
        const { rol } = req.body;
        const updateFields = {};

        if(rol){
            updateFields.rol = rol;
        }

        const usuarioActualizado = await User.findOneAndUpdate(
            { _id: req.params.id },  // <-- filtro como objeto
            updateFields,
            { new: true, runValidators: true }
        ).select('-password -resetToken -tokenExpiry');

        if (!usuarioActualizado) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.error("Error al modificar usuario:", error);
        return res.status(500).json({ message: "Error al modificar el usuario" });
    }
}


/**
 * Se encarga de resetear la contraseña de un usuario en especifico obteniendo un token de identificación del usuario para poder realizar la operacion.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, password2 } = req.body;

  if (password !== password2) {
    return res.status(400).json({ message: "Las contraseñas no coinciden", ok: false });
  }

  const user = await User.findOne({ resetToken: token });

  if (!user) {
    return res.status(400).json({ message: "Token inválido o expirado", ok: false });
  }

  user.password = password;
  user.resetToken = undefined;
  user.tokenExpiry = undefined;

  await user.save(); 

  return res.status(201).json({ message: "Contraseña actualizada correctamente", ok: true });
};


/**
 * Esta función se encarga de realizar las operaciones necesarias para preparar al usuario cuya contraseña va a ser restablecida
 * y envia un correo a esa persona que necesita cambiar su contraseña.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }); // => Aqui comprobamos que el usuario existe

    if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado en nuestra base de datos", ok: false });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    await user.save();

    const resetUrl = `https://www.ticketsweb.es/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_APP_ACCOUNT,
            pass: process.env.GMAIL_APP_PASS
        }
    });

    await transporter.sendMail({
        to: user.email,
        subject: "Recupera tu contraseña",
        html: `<p>Haz click <a href="${resetUrl}">aquí</a> para restablecer tu contraseña</p>`
    });

    return res.status(201).json({ message: "Correo enviado", ok: true });

}

module.exports = {
    loginUser,
    logoutUser,
    registerUser,
    getAllUsers,
    updateUser,
    deleteUser,
    resetPassword,
    forgotPassword
}