const mariadb = require('mariadb');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const { Sequelize } = require('sequelize');
dotenv.config();

//middleware
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static('../frontend/public'));
const userRoute = require('./routes/userRoute.js');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
// route de usuarios
app.use('/user', userRoute);


//Creacion del pool para realizar la conexion
const pool = mariadb.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    connectionLimit: 5 //* conexiones máximas simultaneas
});

//* Creacion de Sequelize
const sequelize = new Sequelize({
    dialect: 'mariadb',
    host: process.env.HOST_DB,
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE_NAME,
    logging: console.log //* Para ver las consultas SQL
});
app.set('sequelize', sequelize); //* Esto lo que hace es hacer disponible sequelize en toda la aplicacion

//* Realizar prueba de conexion
sequelize.authenticate()
    .then(() => console.log("Conexion con la base de datos con sequelize"))
    .catch(err => console.error("ERROR: Error en la conexion", err));


// Intetnara conectar a la base de datos 
pool.getConnection()
    .then(conn => {
        console.log("Conectado con mariadb");
        conn.release(); //* Esto lo que hace es librerar la conexion de vuelta al pool, para que no esté realizando la llama a cada rato
    })
    .catch(err => console.error("ERROR:",err));

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

app.listen(port, () => {
    console.log("Servidor escuchando por http://localhost:" + port);
});

