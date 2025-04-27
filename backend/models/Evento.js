const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  fecha: { type: Date, required: true },
  lugar: { 
    nombre: { type: String, required: true},
    lat: { type: Number, required: true},
    lon: { type: Number, required: true}
  },
  capacidad: { type: Number, required: true },
  imagen: { type: String },
  entradas: [{ 
    tipo: { type: String, required: true},
    cantidad: { type: Number, required: true},
    precio: { type: Number, required: true}
  }],
  creador:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
