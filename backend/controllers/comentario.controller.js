const Comentario = require('../models/Comentario');
const Evento = require('../models/Evento');
const jsonwebtoken = require('jsonwebtoken');

const crearComentario = async(req, res) => {

        const token = req.cookies.authToken;
        if(!token){
            res.status(401).json({message: "No autorizado"});
            return;
        }
        
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;
        
        const {evento, comentario, valoracion} = req.body;
        console.log(evento);

        if(!evento || !comentario || !valoracion){
            console.log("Error, no se ha rellenado el evento, comentario o valoración");
            return res.status(400).json({message: "Por favor rellena los campos obligatorios"});
        }

        const eventoEncontrado = await Evento.findById(evento);
        console.log(eventoEncontrado);
        if (!eventoEncontrado) {
            console.log(eventoEncontrado);
            return res.status(404).json({ message: "Evento no encontrado" });
        }

        const nuevoComentario = new Comentario({
            id_usuario,
            id_evento: eventoEncontrado._id,
            comentario,
            valoracion
        });

        await nuevoComentario.save();

        res.status(201).json({message: "Comentario guardado correctamente"});

};

const obtenerComentariosDelUsuario = async(req, res) => {
    try {
       const token = req.cookies.authToken;
        if(!token){
            res.status(401).json({message: "No autorizado"});
            return;
        }
        
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const id_usuario = decoded.userId;
        
        const comentarios = await Comentario.find({ id_usuario })
        .populate('id_evento', 'nombre fecha') 
        .sort({ _id: -1 }) 
        .lean();

        const comentariosFinal = [];

        for(let i=0; i<comentarios.length;i++){
            const comentario = comentarios[i];
            
            const nuevoComentario = {
                _id: comentario._id,
                comentario: comentario.comentario,
                valoracion: comentario.valoracion,
                createdAt: comentario.createdAt
            };

            if (comentario.id_evento && comentario.id_evento.nombre) {
                nuevoComentario.nombreEvento = comentario.id_evento.nombre;
            } else {
                nuevoComentario.nombreEvento = "Evento desconocido";
            }

            if (comentario.id_evento && comentario.id_evento.fecha) {
                nuevoComentario.fechaEvento = comentario.id_evento.fecha;
            }

            comentariosFinal.push(nuevoComentario);
        }
            
        res.json(comentariosFinal);
        
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los comentarios" });
    }
}


const getAllComments = async (req,res) => {

    let comentarios = await Comentario.find({})
    .populate('id_usuario', 'nombre');

    console.log(comentarios);

    if(!comentarios){
        return res.status(404).json({ message: "No se encontró ningun comentario", ok: false });
    }

    return res.status(200).json({ comentarios });

}


module.exports = {
    crearComentario,
    obtenerComentariosDelUsuario,
    getAllComments
};
