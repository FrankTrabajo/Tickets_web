const Comentario = require('../models/Comentario');
const jsonwebtoken = require('jsonwebtoken');

const crearComentario = async(req, res) => {
    try {
        const token = req.cookies.authToken;
        if(!token){
            res.status(401).json({message: "No autorizado"});
            return;
        }
        
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;
        
        const {id_evento, comentario, valoracion} = req.body;

        if(!id_evento || !comentario || !valoracion){
            return res.status(400).json({message: "Por favor rellena los campos obligatorios"});
        }

        const nuevoComentario = new Comentario({
            id_usuario,
            id_evento,
            comentario,
            valoracion
        });

        await nuevoComentario.save();

        res.status(201).json({message: "Comentario guardado correctamente"});
    } catch (error) {
        res.status(500).json({ message: "Error al guardar el comentario" });
    }
};


module.exports = {
    crearComentario
};