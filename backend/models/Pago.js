const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  id_pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  metodo_pago: { type: String, enum: ['tarjeta', 'paypal', 'cripto'], required: true },
  estado: { type: String, enum: ['pendiente', 'completado', 'fallido'], default: 'pendiente' },
  fecha_pago: { type: Date, default: Date.now }
}, {
  collection: 'pagos',
  versionKey: false
});

module.exports = mongoose.model('Pago', pagoSchema);
