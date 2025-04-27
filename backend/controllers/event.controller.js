const Evento = require("../models/Evento");

const newEvent = async (req,res) => {

    try{
        const { nombre, descripcion, fecha, lugar, capacidad, imagen, entradas } = req.body;

        const nuevoEvento = new Evento({
            nombre,
            descripcion,
            fecha,
            lugar,
            capacidad,
            imagen,
            entradas
        });

        await nuevoEvento.save();
        res.status(201).json({ mensaje: "Evento creado correctamente", evento: nuevoEvento});
    }catch(e){
        console.error("ERROR: Ha habido un error al crear el nuevo evento:", e);
        res.status(500).json({ error: 'Hubo un problema al guardar el evento' });
    }

};

const removeEvent = async (req,res) => {

}

const updateEvent = async (req,res) => {
    
}

module.exports = {
    newEvent
}