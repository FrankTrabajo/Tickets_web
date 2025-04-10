const express = require('express');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config();

//* ---- LOGIN -----
const jsonwebtoken = require('jsonwebtoken');
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

    const token = jsonwebtoken.sign(
      { userId: user._id, email: user.email, role: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict'
    });

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ message: "Login correcto", user: userData });

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
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }
  
      if (password1 !== password2) {
        return res.status(400).json({ message: "Las contraseñas no coinciden" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El email ya está registrado" });
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
        return res.status(400).json({ message: "El email ya está registrado" });
      }
      res.status(500).json({ message: error.message });
    }
  };
  
module.exports = {
    loginUser,
    logoutUser,
    registerUser
}