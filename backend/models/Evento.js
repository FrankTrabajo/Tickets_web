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
  entradas: { 
    tipo: { type: String, required: true},
    cantidad: { type: Number, required: true},
    precio: { type: Number, required: true}
  }, // Aqui guardará el tipo de entrada, la cantidad de entradas que hay y el precio
  /**
   * por ejemplo
   * { tipo: grada ,
   *    cantidad: 100,
   *    precio: 70€ },
   * { tipo: pista ,
   *    cantidad: 160,
   *    precio: 90€ },
   */
}, {
  timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
