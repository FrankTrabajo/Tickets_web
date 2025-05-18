const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
dotenv.config();
const cors = require('cors');

// Importar middleware de upload configurado
const upload = require('./middlewares/uploads.js');

// Configuración de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://www.ticketsweb.es',
    credentials: true,
}));

// Conexión a MongoDB
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@prueba1.8u19y.mongodb.net/Tickets_Web?retryWrites=true&w=majority&appName=Prueba1`)
    .then(() => console.log("Conectado a MongoDB"))
    .catch(err => console.log("Error de conexión a MongoDB:", err));

// Routes
const userRoute = require('./routes/userRoute');
const eventRoute = require('./routes/eventRoute');
app.use('/api/user', userRoute);
app.use("/api/event", eventRoute);

// Rutas de vistas
app.get('/', (req, res) => {
    // Tu lógica para la ruta principal
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'login.html'));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'register.html'));
});

app.get("/admin_dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'admin.html'));
});

app.get("/admin_dashboard/new_event", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'nuevoEvento.html'));
});

app.get("/admin_dashboard/details/:id", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'detallesEvento.html'));
});

app.get("/admin_dashboard/update/:id", (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'editEvento.html'));
});

app.get("/vistaEntradas/:id", (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'vistaEntradas.html'));
});

app.get("/comprar", (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'comprarEntrada.html'));
});

// Rutas de autenticación
app.get("/check-auth", (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(200).json({ logueado: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ logueado: true, usuario: decoded.email });
    } catch (error) {
        res.status(200).json({ logueado: false });
    }
});

app.get("/check-admin", (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ admin: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ admin: decoded.rol.includes('ADMIN') });
    } catch (error) {
        console.error("Token inválido:", error);
        res.status(401).json({ admin: false });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});