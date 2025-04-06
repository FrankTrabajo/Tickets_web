//* Constantes
const sequelize = require('../config/database.js');
const { DataTypes } = require('sequelize');
const User = require('../models/User.js')(sequelize, DataTypes); // <-- aquí se pasa sequelize y DataTypes

const express = require('express');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config();

//* ---- LOGIN -----
const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({ where: { email }});
        if(!user){
            return res.status(400).json({message: "Uusario no encontrado" });
        }
        const passOk = await user.comparePassword(password);
        if(!passOk){
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }
        // Crear el TOKEN
        const token = jsonwebtoken.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Enviar el token como cookie
        res.cookie('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000, sameSite: "strict" });

        // ENo devolver la contraseña en la respuesta
        const userData = user.get({ plain: true });
        delete userData.password;

        res.status(200).json({ message: "Login correcto", user: userData });
    } catch (error) {
        console.log("Error en el login", error);
        res.status(500).json({message: "Error al iniciar sesión"});
    }
}


const logoutUser = async (req,res) => {
    try {
        res.clearCookie('authToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ message: "Sesion cerrada" });
    } catch (error) {
        res.status(404).json({ message: "ERROR: Hubo un error al cerrar sesión" });
    }
}

const registerUser = async (req,res) => {
    const transaction = await sequelize.transaction();
    try {
        const { nombre, email, password1, password2 } = req.body;
        console.log(nombre, email, password1);
        if(!nombre || !email || !password1 || !password2){
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        if(password1 !== password2){
            return res.status(400).json({ message: "Las contraseñas no coinciden" });
        }

        // Comprobamos que el usuario existe
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser){
            return res.status(400).json({ message: "El email ya está registrado" });
        }


        // Sequelize automáticamente encripta la contraseña antes de guardar
        const newUser = await User.create({
            nombre,
            email,
            password: password1
        }, { transaction });
        console.log("Usuario registrado");
        
        await transaction.commit();

        // No devolver la contraseña en la respuesta
        const userData = newUser.get({ plat: true });
        delete userData.password;
        
        res.status(201).json(userData);

    } catch (error) {
        await transaction.rollback();
        console.log("ERROR: Error en el registro", error);
        if(error.name === 'SequelizeUniqueConstrainError'){
            return res.status(400).json({ message: "El email ya está registrado" });
        }
        if(error.name === 'SequelizeValidationError'){
            return res.status(400).json({ message: "Error de validación", error: error.message });
        }
        res.status(500).json({message: error.message });
    }
}

module.exports = {
    loginUser,
    logoutUser,
    registerUser
}