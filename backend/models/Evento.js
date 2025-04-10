const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  fecha: { type: Date, required: true },
  lugar: { type: String, required: true },
  precio: { type: mongoose.Types.Decimal128, required: true },
  capacidad: { type: Number, required: true },
  imagen: { type: String },
  creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, {
  collection: 'eventos',
  versionKey: false
});

module.exports = mongoose.model('Evento', eventoSchema);
