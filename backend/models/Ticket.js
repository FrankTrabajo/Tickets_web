const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  id_evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  precio: { type: mongoose.Types.Decimal128, required: true },
  estado: { type: String, enum: ['disponible', 'vendido'], default: 'disponible' },
  codigo: { type: String, required: true, unique: true },
  fecha_compra: { type: Date }
}, {
  collection: 'tickets',
  versionKey: false
});

module.exports = mongoose.model('Ticket', ticketSchema);
