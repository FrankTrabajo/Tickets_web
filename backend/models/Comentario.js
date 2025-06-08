const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema(
    {
        id_usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        id_evento: {type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true},
        comentario: {type: String, required: true, trim: true},
        valoracion: {type: Number, required: true, min: 1, max: 5}
    }, 

    {
        collection: 'comentarios',
        versionKey: false, 
        timestamps: { createdAt: true, updatedAt: false }
    }

);

const Comentario = mongoose.model('Comentario', comentarioSchema);

module.exports = Comentario;