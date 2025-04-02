//* Constantes
const express = require('express');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const { connection } = require('mongoose');

//* ---- LOGIN -----
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const [users] = await connection.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if(users.length === 0){
            return res.status(400).json({message: "Usuario no encontrado"});
        }
        const user = users[0];

        const passOk = await bcrypt.compare(password, user.password);
        if(!passOk){
            return res.status(400).json({message: "Contraseña incorrecta"});
        }

        //Crear TOKEN
        const token = jsonwebtoken.sign({userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {expires: '1h'});
        //Enviar el token como cookie
        res.cookie('authToken', token, {httpOnly:true, secure: false, maxAge: 3600000});

        res.status(200).json({message: "Login correcto", user});
        
    } catch (error) {
        res.status(500).json({message: "Error al iniciar sesión"});
    }
}

const logoutUser = async (req,res) => {
    try {
        res.clearCookie('authToken');
        res.json({message: "Sesion cerrada"});
    } catch (error) {
        res.status(404).json({message: "ERROR: Hubo un error al cerrar sesión"});
    }
}

const registerUser = async (req,res) => {
    try {
        const { name, email, password1, password2} = req.body;

        if(!name || !email || !password1 || !password2){
            return res.status(400).json({message: "Todos los campos son obligatorios"});
        }
        if(password1 !== password2){
            return res.status(400).json({message: "ERROR: Las contraseñas no coinciden"});
            
        }
        //Comprobamos si el usuario existe
        const [existingUser] = await connection.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if(existingUser.length > 0){
            return res.sendFile(Path2D.join(__dirname, 'public', 'login.html'));
        }
        
        const salt = await bcrypt.genSalt(5);
        const hashPassword = await bcrypt.hash(password1, salt);
        
        const [result] = await connection.execute('INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)', [name, email, hashPassword]);


        const [newUser] = await connection.query("SELECT id, name, email FROM usuarios WHERE id = ?", [result.id]);

        return res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({message: error.message });
    }
}

module.exports = {
    loginUser,
    logoutUser,
    registerUser
}