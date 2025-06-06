const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');


dotenv.config();

//* ----------- AQUI HAY USUARIOS CLIENTES Y ADMINISTRADORES DE EVENTOS -------------


//* ---- LOGIN -----
const User = require('../models/User.js');

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

        res.status(201).json(userData);

    } catch (error) {
        console.log("ERROR: Error en el registro", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "El email ya está registrado", ok: true });
        }
        res.status(500).json({ message: error.message });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        return res.status(201).json({ users });
    } catch (error) {
        console.error("ERROR: No se pudo obtener los usuarios");
        return res.status(500).json({ message: "Error, no se pudo obtener los usuarios" });
    }
}

const deleteUser = async (req, res) => {
    
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: "No autorizado", ok: false });
        }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const rol = decoded.rol;
        console.log(decoded);
        if(!rol.includes("SUPER_ADMIN")){
            return res.status(401).json({ message: "No autorizado", ok: false });
            
        }
        // Verificar si el evento existe y pertenece al usuario
        await User.findByIdAndDelete(req.params.id);
        console.log("USUARIO ELIMINADO");
        return res.status(200).json({ message: "Usuario eliminado correctamente" , ok: true});


}

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



const resetPassword = async (req, res) => {
    
        const { token } = req.params;
        const { password, password2 } = req.body;

        if (password !== password2) {
            return res.status(400).json({ message: "Las contraseñas no coinciden", ok: false });
        }

        const user = await User.findOne({
            resetToken: token
        });

        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado", ok: false });
        }

        const hashedPassword = await bcryptjs.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        return res.status(201).json({ message: "Contraseña actualizada correctamente", ok: true });
 

}

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