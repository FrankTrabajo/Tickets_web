const mariadb = require('mariadb');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
dotenv.config();
const cors = require('cors');

//middleware
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('../frontend/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'https://www.ticketsweb.es',
    credentials: true,
}));


//Routes
const userRoute = require('./routes/userRoute.js');
const eventRoute = require('./routes/eventRoute.js');
app.use('/api/user', userRoute);
app.use("/api/event", eventRoute);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@prueba1.8u19y.mongodb.net/Tickets_Web?retryWrites=true&w=majority&appName=Prueba1`)
    .then(() => {
        console.log("Conectado");
    })
    .catch((err) => {
        console.log("Error de conexion", err);
    });


//* Ruta index de nuestra web
app.get('/', (req, res) => {
    
});

// ruta de Login
app.get("/login", (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'login.html'));
});

// ruta de register
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'register.html'));
});

// ruta de administrador //Aqui deberia de llevar al perfil del administrador del evento, por ejemplo /admin_dashboard/:id.
app.get("/admin_dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'admin.html'));
});

app.get("/admin_dashboard/new_event", (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'nuevoEvento.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("Servidor escuchando por http://localhost:" + PORT);
});


// Ruta para comprobar si el usuario está logueado o no
app.get("/check-auth", (req, res) => {
    if(req.cookies.authToken) {
        res.status(200).json({ logueado: true });
    }else {
        res.status(200).json({ logueado: false });
    }
});

// Ruta para comprobar si el usuario logueado es admin o no
app.get("/check-admin", (req, res) => {
    console.log(req.cookies);
    const token = req.cookies.authToken;
    if (!token) {
        console.warn("No auth token provided");
        return res.status(401).json({ admin: false });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ admin: decode.rol.includes('ADMIN') });
    } catch (error) {
        console.error("Token inválido:", error);
        res.status(401).json({ admin: false });
    }
});


// Ruta para comprobar si el usuario está logueado o no
app.get("/check-auth", (req, res) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(200).json({ logueado: false });  // No token, no autenticado
    }

    try {
        // Verificamos el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Si la verificación es exitosa, respondemos que el usuario está autenticado
        res.status(200).json({ logueado: true, usuario: decoded.email });
    } catch (error) {
        // Si el token no es válido o ha expirado, respondemos que no está autenticado
        res.status(200).json({ logueado: false });
    }
});


//Ruta para comprobar si el usuario esta activo o no
// app.get('/check-active', (req,res) => {
//     const token = req.cookies.authToken;
//     try {
//         const decode = jwt.verify(token, process.env.JWT_SECRET);
//         res.json({ active: decode.active });
//     } catch (error) {
//         res.json({ active: decode.active });
//     }
// })

