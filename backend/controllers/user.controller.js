//* Constantes
const express = require('express');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');

//* ---- LOGIN -----
const loginUser = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const logoutUser = async (req,res) => {
    try {
        res.clearCookie('authToken');
        res.json({message: "Sesion cerrada"});
    } catch (error) {
        res.json({message: "ERROR: Hubo un error al cerrar sesión"});
    }
}

const registerUser = async (req,res) => {
    try {
        
    } catch (error) {
        
    }
}

module.exports = {
    loginUser,
    logoutUser,
    registerUser
}