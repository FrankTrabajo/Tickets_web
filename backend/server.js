const mariadb = require('mariadb');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
dotenv.config();

//middleware
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('../frontend/public'));
const userRoute = require('./routes/userRoute.js');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
// route de usuarios
app.use('/api/user', userRoute);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@prueba1.8u19y.mongodb.net/?Tickets_WebretryWrites=true&w=majority&appName=Prueba1`)
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

app.listen(PORT, () => {
    console.log("Servidor escuchando por http://localhost:" + PORT);
});

