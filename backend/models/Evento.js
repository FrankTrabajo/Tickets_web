const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  fecha: { type: Date, required: true },
  lugar: { type: String, required: true },
  entradas: { type: [Object] }, // Aqui guardará el tipo de entrada, la cantidad de entradas que hay y el precio
  /**
   * por ejemplo
   * { tipo: grada ,
   *    cantidad: 100,
   *    precio: 70€ },
   * { tipo: pista ,
   *    cantidad: 160,
   *    precio: 90€ },
   */
  capacidad: { type: Number, required: true },
  imagen: { type: String },
  creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, {
  collection: 'eventos',
  versionKey: false
});

module.exports = mongoose.model('Evento', eventoSchema);
